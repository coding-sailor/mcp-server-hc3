import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupTools } from '../tools/index.js';
import { TransportConfig } from './types.js';
import { getConfig } from '../config/index.js';
import { getLogger } from '../logger.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setupHttpTransport } from './http.js';

/**
 * Configure the MCP server with all capabilities
 */
export async function setupServer(): Promise<void> {
  const logger = getLogger();

  const server = new McpServer({
    name: 'mcp-server-hc3',
    version: '1.0.0',
  });

  try {
    logger.info('Setting up tools...');
    await setupTools(server);

    logger.info('Setting up transport...');
    await setupTransport(server);

    logger.info('✅ MCP Server setup completed successfully!');
  } catch (error) {
    logger.error('❌ Failed to setup MCP Server:', error);
    throw error;
  }
}

async function setupTransport(server: McpServer): Promise<void> {
  const logger = getLogger();
  const transportConfig = getTransportConfig();

  switch (transportConfig.type) {
    case 'stdio':
      const transport = new StdioServerTransport();
      logger.info('Using STDIO transport');
      await server.connect(transport);
      break;

    case 'http':
      if (!transportConfig.http) {
        throw new Error('HTTP configuration is required for HTTP transport');
      }
      logger.info(
        `Using HTTP transport on ${transportConfig.http.host}:${transportConfig.http.port}`,
      );
      await setupHttpTransport(server, transportConfig.http);
      break;

    default:
      throw new Error(`Unsupported transport type: ${transportConfig.type as string}`);
  }
}

function getTransportConfig(): TransportConfig {
  const config = getConfig();

  if (config.MCP_TRANSPORT_TYPE === 'http') {
    return {
      type: 'http',
      http: {
        host: config.MCP_HTTP_HOST,
        port: config.MCP_HTTP_PORT,
      },
    };
  }

  return {
    type: 'stdio',
  };
}
