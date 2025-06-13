import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupRoomTools } from './room.tools.js';
import { setupDeviceTools } from './device.tools.js';
import { setupSceneTools } from './scene.tools.js';
import { setupSystemTools } from './system.tools.js';

/**
 * Set up all HC3 tools for the MCP server
 * @param server - The MCP server instance
 */
export async function setupTools(server: McpServer): Promise<void> {
  await setupRoomTools(server);
  await setupDeviceTools(server);
  await setupSceneTools(server);
  await setupSystemTools(server);
}
