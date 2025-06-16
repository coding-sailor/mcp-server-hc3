import type { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/index.js';
import { getLogger } from '../logger.js';

/**
 * API Key authentication middleware
 */
export function auth(req: Request, res: Response, next: NextFunction): void {
  const config = getConfig();
  const logger = getLogger();

  // Skip authentication if no API key is configured
  if (!config.MCP_HTTP_API_KEY) {
    logger.warn('⚠️ No MCP_HTTP_API_KEY configured - HTTP transport is unprotected');
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey || apiKey !== config.MCP_HTTP_API_KEY) {
    logger.warn('Invalid API key provided');
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized',
      },
      id: null,
    });
    return;
  }

  next();
}
