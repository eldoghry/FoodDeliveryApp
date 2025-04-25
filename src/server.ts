import { config } from './config/env';
import { createApp } from './app';
import logger from './config/logger';

async function startServer() {
  try {
    const app = createApp();

    // start database connection
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
