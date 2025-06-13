import winston from 'winston';
import type { Config } from './config/index.js';

/**
 * Create a Winston logger instance with appropriate configuration
 */
export function createLogger(config: Config): winston.Logger {
  const logFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (stack) {
        return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
      }
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  );

  const transports: winston.transport[] = [];

  // Add console transport for all transport types except stdio
  // stdio transport requires clean JSON communication
  if (config.MCP_TRANSPORT_TYPE !== 'stdio') {
    transports.push(
      new winston.transports.Console({
        level: config.LOG_LEVEL,
        format: winston.format.combine(winston.format.colorize(), logFormat),
      }),
    );
  }

  // Add file transport for persistent logging
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );

  // Add combined log file for all levels
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: config.LOG_LEVEL,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );

  return winston.createLogger({
    level: config.LOG_LEVEL,
    format: logFormat,
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
  });
}

let globalLogger: winston.Logger | null = null;

/**
 * Initialize the global logger instance
 */
export function initializeLogger(config: Config): void {
  globalLogger = createLogger(config);
}

/**
 * Get the initialized logger instance
 * @returns The Winston logger instance
 * @throws Error if logger has not been initialized
 */
export function getLogger(): winston.Logger {
  if (globalLogger === null) {
    throw new Error('Logger not initialized. Call initializeLogger() first.');
  }
  return globalLogger;
}

/**
 * Create a minimal logger for configuration phase (before full initialization)
 * This ensures we can log during configuration validation
 */
export function createConfigLogger(): winston.Logger {
  return winston.createLogger({
    level: 'error',
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    transports: [new winston.transports.Console()],
  });
}
