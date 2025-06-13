import { z } from 'zod';

export const FibaroDeviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  roomID: z.number(),
  type: z.string(),
  baseType: z.string().optional(),
  enabled: z.boolean().optional(),
  visible: z.boolean().optional(),
  interfaces: z.array(z.string()).optional(),
  properties: z.record(z.unknown()).optional(),
  actions: z.record(z.unknown()).optional(),
  created: z.number().optional(),
  modified: z.number().optional(),
  sortOrder: z.number().optional(),
  parentId: z.number().optional(),
  isPlugin: z.boolean().optional(),
});

export const FibaroDeviceActionArgsSchema = z.object({
  delay: z.number().optional().describe('Action delay in seconds'),
  args: z.array(z.unknown()).optional().describe('Action arguments'),
});

export type FibaroDevice = z.infer<typeof FibaroDeviceSchema>;
export type FibaroDeviceActionArgs = z.infer<typeof FibaroDeviceActionArgsSchema>;
