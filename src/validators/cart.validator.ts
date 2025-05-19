import Joi from 'joi';

export const addItemToCartBodySchema = Joi.object({
	restaurantId: Joi.number().integer().min(1).required(),
	itemId: Joi.number().integer().min(1).required(),
	quantity: Joi.number().integer().min(1).required()
}).required();

export const getCartParamsSchema = Joi.object({
	cartId: Joi.number().min(1).required()
}).required();

export const updateQuantityBodySchema = Joi.object({
	quantity: Joi.number().min(1).required().messages({
		'any.required': 'Quantity is required',
		'number.base': 'Quantity must be a number',
		'number.min': 'Quantity must be at least 1'
	})
}).required();

export const updateQuantityParamsSchema = Joi.object({
	cartId: Joi.number().min(1).required(),
	cartItemId: Joi.number().min(1).required()
}).required();


export const clearCartParamsSchema = Joi.object({
	cartId: Joi.number().min(1).required(),
}).required();

export const deleteCartItemParamsSchema = Joi.object({
	cartId: Joi.number().min(1).required(),
	cartItemId: Joi.number().min(1).required()
}).required();