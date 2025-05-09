import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';

// export function validateBody<T extends object>(targetClass: ClassConstructor<T>) {
// 	return async (req: Request, _res: Response, next: NextFunction) => {
// 		const instance = plainToInstance(targetClass, req.body);
// 		const errors = validateSync(instance, {
// 			forbidUnknownValues: true,
// 			validationError: {
// 				target: false
// 			}
// 		});
// 		const fieldsErrors: { [name: string]: { message: string; value: string } } = {};

// 		if (errors.length > 0) {
// 			errors.forEach((error) => {
// 				if (error.constraints) {
// 					fieldsErrors[error.property] = {
// 						message: Object.values(error.constraints).join(', '),
// 						value: error.value
// 					};
// 				}
// 				if (error.children) {
// 					error.children.forEach((errorNested) => {
// 						if (errorNested.constraints) {
// 							fieldsErrors[errorNested.property] = {
// 								message: Object.values(errorNested.constraints!).join(', '),
// 								value: errorNested.value
// 							};
// 						}
// 					});
// 				}
// 			});
// 			next(new ValidateError(fieldsErrors, 'Validation failed'));
// 			return;
// 		}
// 		next();
// 	};
// }

export function validateRequest<T extends object>(
	targetClass: ClassConstructor<T>,
	dataType: 'body' | 'query' | 'params' = 'body'
) {
	return async (req: Request, _res: Response, next: NextFunction) => {
		let dataToValidate: any;
		switch (dataType) {
			case 'body':
				dataToValidate = req.body;
				break;
			case 'query':
				dataToValidate = req.query;
				break;
			case 'params':
				dataToValidate = req.params;
				break;
			default:
				return next(new Error('Invalid dataType'));
		}

		// Convert data to class instance for validation
		const instance = plainToInstance(targetClass, dataToValidate);

		// Validate the instance
		const errors = validateSync(instance, {
			forbidUnknownValues: true,
			validationError: {
				target: false
			}
		});

		const fieldsErrors: { [name: string]: { message: string; value: string } } = {};
		if (errors.length > 0) {
			errors.forEach((error) => {
				if (error.constraints) {
					fieldsErrors[error.property] = {
						message: Object.values(error.constraints).join(', '),
						value: error.value
					};
				}
				if (error.children) {
					error.children.forEach((errorNested) => {
						if (errorNested.constraints) {
							fieldsErrors[errorNested.property] = {
								message: Object.values(errorNested.constraints!).join(', '),
								value: errorNested.value
							};
						}
					});
				}
			});
			next(new ValidateError(fieldsErrors, 'Validation failed'));
			return;
		}

		next();
	};
}
