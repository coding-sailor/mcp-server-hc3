import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { HttpTransportConfig } from './types.js';
import { getLogger } from '../logger.js';

/**
 * Set up HTTP transport for the MCP server using Express and StreamableHTTPServerTransport
 * @param server - The MCP server instance
 * @param config - HTTP configuration options
 */
export async function setupHttpTransport(
  server: McpServer,
  config: HttpTransportConfig,
): Promise<void> {
  const logger = getLogger();
  const express = await import('express');
  const app = express.default();

  app.use(express.default.json());

  // Store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Handle POST requests for client-to-server communication
  app.post('/mcp', async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let currentTransport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        currentTransport = transports[sessionId];
      } else if (!sessionId && req.body?.method === 'initialize') {
        // New initialization request
        currentTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            logger.info(`HTTP session initialized: ${sessionId}`);
            transports[sessionId] = currentTransport;
          },
        });

        // Clean up transport when closed
        currentTransport.onclose = () => {
          if (currentTransport.sessionId) {
            delete transports[currentTransport.sessionId];
            logger.info(`HTTP session closed: ${currentTransport.sessionId}`);
          }
        };

        // Connect to the MCP server
        await server.connect(currentTransport);
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      // Handle the request
      await currentTransport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error('❌ Error handling HTTP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Handle GET requests for server-to-client notifications via SSE
  app.get('/mcp', async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const currentTransport = transports[sessionId];
      await currentTransport.handleRequest(req, res);
    } catch (error) {
      logger.error('❌ Error handling HTTP GET request:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  });

  // Handle DELETE requests for session termination
  app.delete('/mcp', async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const currentTransport = transports[sessionId];
      await currentTransport.handleRequest(req, res);

      // Clean up the session
      delete transports[sessionId];
      logger.info(`🗑️ HTTP session terminated: ${sessionId}`);
    } catch (error) {
      logger.error('❌ Error handling HTTP DELETE request:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  });

  // Start the HTTP server
  app.listen(config.port, config.host, () => {
    logger.info(`HTTP server listening on http://${config.host}:${config.port}/mcp`);
  });
}
