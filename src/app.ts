import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ApiRouter from './routes/api.routes';
import { ErrorHandler, NotFoundHandler } from './middlewares';
import { defaultRateLimiter } from './config/ratelimiter';

export const createApp = (): Application => {
  const app = express();

  // register middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(defaultRateLimiter);

  // setup routes
  app.use('/api/v1', ApiRouter);

  // error handler
  app.use(NotFoundHandler);
  app.use(ErrorHandler);

  return app;
};
