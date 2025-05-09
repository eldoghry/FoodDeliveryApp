import { ValidateError } from 'tsoa';
import { Request, Response, NextFunction } from 'express';
import ApplicationError from '../errors/application.error';

export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof ValidateError) {
		const errorMessages: string[] = [];

		Object.keys(err.fields).forEach((key) => {
			errorMessages.push(`${err.fields[key].message}`);
		});

		return next(new ApplicationError('Validation Error', 400, true, errorMessages));
	}

	next(err); // pass on the error if it's not a validation error
};
