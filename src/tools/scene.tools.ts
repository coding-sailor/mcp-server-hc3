import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFibaroClient } from '../fibaro/client.js';
import { createErrorResponse } from './common.js';

/**
 * Set up scene-related tools for the MCP server
 * @param server - The MCP server instance
 */
export async function setupSceneTools(server: McpServer): Promise<void> {
  // List all scenes tool
  server.tool(
    'list_scenes',
    {
      alexaProhibited: z.boolean().optional().describe('Filter by Alexa status'),
    },
    async ({ alexaProhibited }) => {
      try {
        const client = getFibaroClient();
        const scenes = await client.scenes.getScenes(alexaProhibited);

        if (scenes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No scenes found.',
              },
            ],
          };
        }

        const sceneList = scenes
          .map(
            (scene) =>
              `${scene.id}: ${scene.name} (${scene.type}-${scene.mode})${
                scene.enabled === false ? ' [Disabled]' : ''
              }${scene.hidden === true ? ' [Hidden]' : ''}${
                scene.isRunning === true ? ' [Running]' : ''
              }${scene.protectedByPin === true ? ' [PIN]' : ''}`,
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${scenes.length} scenes:\n${sceneList}`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Get specific scene details tool
  server.tool(
    'get_scene',
    {
      sceneId: z.number().describe('Scene ID'),
      alexaProhibited: z.boolean().optional().describe('Filter by Alexa status'),
    },
    async ({ sceneId, alexaProhibited }) => {
      try {
        const client = getFibaroClient();
        const scene = await client.scenes.getScene(sceneId, alexaProhibited);

        const details = `Scene ${scene.id}: ${scene.name}
Type: ${scene.type}-${scene.mode}, Room: ${scene.roomId || 'None'}
Status: Enabled:${scene.enabled !== false}, Running:${scene.isRunning || false}, PIN:${scene.protectedByPin || false}
Description: ${scene.description || 'None'}
Max Instances: ${scene.maxRunningInstances || 'Unlimited'}`;

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

  // Execute scene tool
  server.tool(
    'execute_scene',
    {
      sceneId: z.number().describe('Scene ID'),
      synchronous: z.boolean().optional().default(false).describe('Wait for completion'),
      alexaProhibited: z.boolean().optional().describe('Alexa prohibited setting'),
      args: z.record(z.unknown()).optional().describe('Scene arguments'),
      pin: z.string().optional().describe('PIN for protected scenes'),
    },
    async ({ sceneId, synchronous, alexaProhibited, args, pin }) => {
      try {
        const client = getFibaroClient();

        // First get scene details to confirm it exists and get its name
        const scene = await client.scenes.getScene(sceneId);

        const executeRequest = {
          alexaProhibited,
          args,
        };

        if (synchronous) {
          await client.scenes.executeSceneSync(sceneId, executeRequest, pin);
        } else {
          await client.scenes.executeScene(sceneId, executeRequest, pin);
        }

        const syncText = synchronous ? ' synchronously' : ' asynchronously';
        const argsText =
          args && Object.keys(args).length > 0 ? ` with args: ${JSON.stringify(args)}` : '';

        return {
          content: [
            {
              type: 'text',
              text: `✅ Successfully executed${syncText} scene ${sceneId}: "${scene.name}"${argsText}`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Kill scene tool
  server.tool(
    'kill_scene',
    {
      sceneId: z.number().describe('Scene ID'),
      pin: z.string().optional().describe('PIN for protected scenes'),
    },
    async ({ sceneId, pin }) => {
      try {
        const client = getFibaroClient();

        // First get scene details to confirm it exists and get its name
        const scene = await client.scenes.getScene(sceneId);

        await client.scenes.killScene(sceneId, pin);

        return {
          content: [
            {
              type: 'text',
              text: `🛑 Successfully killed scene ${sceneId}: "${scene.name}"`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );
}
