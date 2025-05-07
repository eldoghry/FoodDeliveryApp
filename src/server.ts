import 'reflect-metadata';
import { config } from './config/env';
import { createApp } from './app';
import logger from './config/logger';
import { AppDataSource } from './config/data-source';

async function startServer() {
  try {
    const app = createApp();

    // start database connection
    try {
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Error connecting to the database:', error);
      process.exit(1);
    }
    // start redis connection

    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port} | ENV:(${config.env})`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
