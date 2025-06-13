import { z } from 'zod';
import { createConfigLogger } from '../logger.js';

const ConfigSchema = z.object({
  MCP_HTTP_HOST: z.string().default('localhost'),
  MCP_HTTP_PORT: z.coerce.number().int().positive().default(3000),
  MCP_TRANSPORT_TYPE: z.enum(['stdio', 'http']).default('stdio'),

  HC3_HOST: z.string().min(1, 'HC3_HOST is required'),
  HC3_USERNAME: z.string().min(1, 'HC3_USERNAME is required'),
  HC3_PASSWORD: z.string().min(1, 'HC3_PASSWORD is required'),
  HC3_PORT: z.coerce.number().int().positive().default(80),

  SERVER_TIMEOUT: z.coerce.number().int().positive().default(10000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;

let globalConfig: Config | null = null;

/**
 * Initialize configuration from environment variables (call once on startup)
 */
export function initializeConfig(): void {
  const configLogger = createConfigLogger();

  try {
    // Parse and validate environment variables
    globalConfig = ConfigSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      configLogger.error('❌ Configuration validation failed:');

      for (const issue of error.issues) {
        const path = issue.path.join('.');
        configLogger.error(`  • ${path}: ${issue.message}`);
      }
    } else {
      configLogger.error('❌ Unexpected configuration error:', error);
    }

    process.exit(1);
  }
}

/**
 * Get the initialized configuration
 * @returns The configuration object
 * @throws Error if configuration has not been initialized
 */
export function getConfig(): Config {
  if (globalConfig === null) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return globalConfig;
}
