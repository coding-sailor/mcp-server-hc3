#!/usr/bin/env node

import { config } from 'dotenv';
config();

import { setupServer } from './mcp/server.js';
import { initializeConfig, getConfig } from './config/index.js';
import { initializeLogger, getLogger } from './logger.js';

async function main(): Promise<void> {
  initializeConfig();
  const config = getConfig();
  initializeLogger(config);
  const logger = getLogger();

  logger.info('✅ Configuration and logger initialized successfully');

  try {
    await setupServer();

    logger.info('Ready to receive commands from MCP clients');
  } catch (error) {
    logger.error('❌ Failed to start MCP Server:', error);

    if (error instanceof Error) {
      logger.error('Error details:', error.message);
      if (error.stack) {
        logger.error('Stack trace:', error.stack);
      }
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  try {
    const logger = getLogger();
    logger.info('\n🛑 Received SIGINT, shutting down MCP Server...');
  } catch {
    console.error('\n🛑 Received SIGINT, shutting down MCP Server...');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  try {
    const logger = getLogger();
    logger.info('\n🛑 Received SIGTERM, shutting down MCP Server...');
  } catch {
    console.error('\n🛑 Received SIGTERM, shutting down MCP Server...');
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  try {
    const logger = getLogger();
    logger.error('💥 Uncaught Exception:', error);
  } catch {
    console.error('💥 Uncaught Exception:', error);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    const logger = getLogger();
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  } catch {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  }
  process.exit(1);
});

// Start the server
main().catch((error) => {
  try {
    const logger = getLogger();
    logger.error('💥 Fatal error starting server:', error);
  } catch {
    console.error('💥 Fatal error starting server:', error);
  }
  process.exit(1);
});
