import Joi from 'joi';

export const createCartBodySchema = Joi.object({}).required();

export const removeItemSchema = Joi.object({
	cartItemId: Joi.number().integer().positive().required().messages({
		'number.base': 'Cart item ID must be a valid number',
		'number.integer': 'Cart item ID must be an integer',
		'number.positive': 'Cart item ID must be positive',
		'any.required': 'Cart item ID is required'
	})
}).required();

export const checkoutSchema = Joi.object({
	addressId: Joi.number().integer().positive().required().messages({
		'number.base': 'Address ID must be a number',
		'number.integer': 'Address ID must be an integer',
		'number.positive': 'Address ID must be positive',
		'any.required': 'Address ID is required'
	}),
	paymentMethodId: Joi.number().integer().positive().required().messages({
		'number.base': 'Payment method ID must be a number',
		'number.integer': 'Payment method ID must be an integer',
		'number.positive': 'Payment method ID must be positive',
		'any.required': 'Payment method ID is required'
	}),
	customerInstructions: Joi.string().max(500).optional().messages({
		'string.max': 'Customer instructions cannot exceed 500 characters'
	})
});
