import { z } from 'zod';

export const FibaroRoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  sectionID: z.number(),
  isDefault: z.boolean().optional(),
  visible: z.boolean().optional(),
  icon: z.string().optional(),
  iconExtension: z.enum(['png', 'svg']).optional(),
  iconColor: z
    .enum(['accent', 'green', 'orange', 'pink', 'purple', 'red', 'violet', 'yellow'])
    .optional(),
  sortOrder: z.number().optional(),
  category: z.string().optional(),
  defaultThermostat: z.number().optional(),
});

export type FibaroRoom = z.infer<typeof FibaroRoomSchema>;
