import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFibaroClient } from '../fibaro/client.js';
import { createErrorResponse } from './common.js';

/**
 * Set up room-related tools for the MCP server
 * @param server - The MCP server instance
 */
export async function setupRoomTools(server: McpServer): Promise<void> {
  // List all rooms tool
  server.tool(
    'list_rooms',
    {
      visible: z.boolean().optional().describe('Filter by visibility'),
      empty: z.boolean().optional().describe('Filter by empty status'),
    },
    async ({ visible, empty }) => {
      try {
        const client = getFibaroClient();
        const rooms = await client.rooms.getRooms(visible, empty);

        return {
          content: [
            {
              type: 'text',
              text: `${rooms.length} rooms:\n${rooms
                .map(
                  (room) => `${room.id}: ${room.name}${room.visible === false ? ' [Hidden]' : ''}`,
                )
                .join('\n')}`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Get specific room details tool
  server.tool(
    'get_room',
    {
      roomId: z.number().describe('Room ID'),
    },
    async ({ roomId }) => {
      try {
        const client = getFibaroClient();
        const room = await client.rooms.getRoom(roomId);

        const details = `Room ${room.id}: ${room.name}
Section: ${room.sectionID}, Category: ${room.category || 'None'}
Visible: ${room.visible !== false}, Default: ${room.isDefault || false}`;

        return {
          content: [
            {
              type: 'text',
              text: details,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );
}
