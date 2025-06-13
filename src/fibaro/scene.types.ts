import { z } from 'zod';

export const FibaroSceneSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['lua', 'json', 'magic', 'scenario']),
  mode: z.enum(['automatic', 'manual']),
  icon: z.string().optional(),
  iconExtension: z.string().optional(),
  content: z.string().optional(),
  maxRunningInstances: z.number().optional(),
  hidden: z.boolean().optional(),
  protectedByPin: z.boolean().optional(),
  stopOnAlarm: z.boolean().optional(),
  enabled: z.boolean().optional(),
  restart: z.boolean().optional().default(true).describe('Allow to restart a running scene'),
  categories: z.array(z.number()).optional(),
  created: z.number().optional(),
  updated: z.number().optional(),
  isRunning: z.boolean().optional().describe('If scene is running return true otherwise false'),
  isScenarioDataCorrect: z
    .boolean()
    .optional()
    .describe(
      'If scene is custom scenario and scenario data is incorrect, e.g. device was deleted',
    ),
  started: z.number().optional().describe('Timestamp of the scene start'),
  roomId: z.number().optional(),
  sortOrder: z.number().optional(),
});

export const ExecuteSceneRequestSchema = z.object({
  alexaProhibited: z.boolean().optional().describe('Execute scene by alexaProhibited'),
  args: z.record(z.unknown()).optional().describe('Optional arguments to pass to the scene'),
});

export type FibaroScene = z.infer<typeof FibaroSceneSchema>;
export type ExecuteSceneRequest = z.infer<typeof ExecuteSceneRequestSchema>;
