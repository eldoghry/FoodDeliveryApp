import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import logger from '../config/logger';
import HttpStatusCodes from 'http-status-codes';
import ErrMessages from '../errors/error-messages';
import ApplicationError from '../errors/application.error';

export const ErrorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
	const responseAt = new Date().toISOString();

	if (err instanceof ApplicationError) {
		// logger.error('', err);

		res.status(err.statusCode).json({
			status: 'error',
			message: err.message,
			// name: err.name,
			isOperational: err.isOperational,
			requestAt: req.requestAt,
			// responseAt,
			details: err?.data
			// stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
		});
	} else {
		logger.error(err?.message || 'Unexpected Error:', err);

		res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
			// name: err.name,
			status: 'error',
			requestAt: req.requestAt,
			// responseAt,
			isOperational: false,
			message: err?.message || ErrMessages.http.InternalServerError
			// stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
		});
	}
};


// handle uncaughtException and unhandledRejection to prevent app from crashing (for security)

process.on('uncaughtException', (err) => {
	logger.error('Uncaught Exception:', err);
	// Exit to avoid running in corrupted state. PM2/Docker will restart it.
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	logger.error('Unhandled Rejection:', reason);
	// Exit for safety
	process.exit(1);
});
