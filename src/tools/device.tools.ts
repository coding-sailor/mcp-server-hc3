import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFibaroClient } from '../fibaro/client.js';
import { createErrorResponse } from './common.js';

/**
 * Set up device-related tools for the MCP server
 * @param server - The MCP server instance
 */
export async function setupDeviceTools(server: McpServer): Promise<void> {
  // List devices tool
  server.tool(
    'list_devices',
    {
      roomId: z.number().optional().describe('Filter by room ID'),
      type: z.string().optional().describe('Filter by type'),
      interfaces: z.array(z.string()).optional().describe('Filter by interfaces'),
    },
    async ({ roomId, type, interfaces }) => {
      try {
        const client = getFibaroClient();
        const devices = await client.devices.getDevices(roomId, interfaces, type);

        if (devices.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No devices found.',
              },
            ],
          };
        }

        const deviceList = devices
          .map(
            (device) =>
              `${device.id}: ${device.name} (${device.type}) Room:${device.roomID}${
                device.enabled === false ? ' [Disabled]' : ''
              }${device.visible === false ? ' [Hidden]' : ''}`,
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${devices.length} devices:\n${deviceList}`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );

  // Get specific device details tool
  server.tool(
    'get_device',
    {
      deviceId: z.number().describe('Device ID'),
    },
    async ({ deviceId }) => {
      try {
        const client = getFibaroClient();
        const device = await client.devices.getDevice(deviceId);

        const details = `Device ${device.id}: ${device.name}
Type: ${device.type}, Room: ${device.roomID}
Enabled: ${device.enabled !== false}, Visible: ${device.visible !== false}
Interfaces: ${device.interfaces?.join(', ') || 'None'}
Actions: ${device.actions ? Object.keys(device.actions).join(', ') : 'None'}`;

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

  // Device action tool - handles all device actions including turnOn, turnOff, toggle, setValue, etc.
  server.tool(
    'call_device_action',
    {
      deviceId: z.number().describe('ID of the device to control'),
      actionName: z
        .string()
        .describe(
          "Action to execute. Common actions: 'turnOn', 'turnOff', 'toggle', 'setValue', 'setLevel', 'setColor', 'open', 'close', 'start', 'stop'",
        ),
      args: z
        .array(z.unknown())
        .optional()
        .describe(
          'Action arguments (e.g., [50] for setValue to 50, [255,0,0] for setColor to red)',
        ),
      delay: z
        .number()
        .optional()
        .describe('Optional delay in seconds before executing the action'),
    },
    async ({ deviceId, actionName, args, delay }) => {
      try {
        const client = getFibaroClient();

        // First get device details to confirm it exists and get its name
        const device = await client.devices.getDevice(deviceId);

        await client.devices.callDeviceAction(deviceId, actionName, {
          args,
          delay,
        });

        const delayText = delay ? ` (with ${delay}s delay)` : '';
        const argsText = args?.length ? ` with args: ${JSON.stringify(args)}` : '';

        // Provide user-friendly action descriptions
        const actionDescriptions: Record<string, string> = {
          turnOn: 'turned ON',
          turnOff: 'turned OFF',
          toggle: 'toggled',
          setValue: 'set value',
          setLevel: 'set level',
          setColor: 'set color',
          open: 'opened',
          close: 'closed',
          start: 'started',
          stop: 'stopped',
        };

        const actionText = actionDescriptions[actionName] || `executed "${actionName}"`;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Successfully ${actionText} device ${deviceId}: "${device.name}"${argsText}${delayText}`,
            },
          ],
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    },
  );
}
