import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ApiRouter from './routes/api.routes';
import { addRequestTimeMiddleware, ErrorHandler, NotFoundHandler } from './middlewares';
import { defaultRateLimiter } from './config/ratelimiter';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDocSpecs from './swagger/swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';

export const createApp = (): Application => {
	initializeTransactionalContext();
	const app = express();

	// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //

	// register middlewares
	app.use(addRequestTimeMiddleware); // add request time
	app.set('trust proxy', '127.0.0.1');
	app.use(express.json({ limit: '1mb' })); // with limit json size for security
	app.use(express.urlencoded({ extended: true, limit: '1mb' })); 
	app.use(cors());
	app.use(helmet());
	app.use(morgan('dev'));
	app.use(defaultRateLimiter);

	// setup routes
	app.use('/api/v1', ApiRouter);

	// swagger
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDocSpecs));

	// health check
	app.get('/', (req, res) => {
		res.json({ message: 'OK' });
	});

	// error handler
	app.use(NotFoundHandler);
	app.use(ErrorHandler);

	return app;
};
