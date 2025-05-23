import Joi from 'joi';

export const authLoginBodySchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8) // minimum length
		.max(30) // maximum length (optional)
		.pattern(new RegExp('[a-z]')) // at least one lowercase
		.pattern(new RegExp('[A-Z]')) // at least one uppercase
		.pattern(new RegExp('[0-9]')) // at least one digit
		.pattern(new RegExp('[^a-zA-Z0-9]')) // at least one special character
		.required()
		.messages({
			'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
			'string.min': 'Password must be at least 8 characters.',
			'string.max': 'Password must not exceed 30 characters.'
		})
}).required();
