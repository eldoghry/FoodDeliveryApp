import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import ApiRouter from './routes/api.routes';
import { addRequestTimeMiddleware, ErrorHandler, NotFoundHandler } from './middlewares';
import { defaultRateLimiter } from './config/ratelimiter';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../dist/swagger.json';
import { validationErrorHandler } from './middlewares/validationError.handler';

export const createApp = (): Application => {
	const app = express();

	// register middlewares
	app.use(addRequestTimeMiddleware); // add request time
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	app.use(helmet());
	app.use(morgan('dev'));
	app.use(defaultRateLimiter);

	// Register tsoa-generated routes
	RegisterRoutes(app);

	// Serve Swagger UI
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	// error handler
	app.use(validationErrorHandler);
	app.use(NotFoundHandler);
	app.use(ErrorHandler);

	return app;
};
