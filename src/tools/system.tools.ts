import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getFibaroClient } from '../fibaro/client.js';
import { createErrorResponse } from './common.js';

/**
 * Set up system-related tools for the MCP server
 * @param server - The MCP server instance
 */
export async function setupSystemTools(server: McpServer): Promise<void> {
  // Test connection tool
  server.tool('test_connection', {}, async () => {
    try {
      const client = getFibaroClient();
      const isConnected = await client.testConnection();

      if (isConnected) {
        return {
          content: [
            {
              type: 'text',
              text: '✅ Successfully connected to HC3 system',
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: '❌ Failed to connect to HC3 system',
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return createErrorResponse(error);
    }
  });
}
