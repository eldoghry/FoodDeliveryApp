import Joi from 'joi';

export const createCartBodySchema = Joi.object({
    
}).required();

export const clearCartSchema = Joi.object({
	cartId: Joi.number().integer().positive().required()
});

export const updateCartQuantitiesParamsSchema = Joi.object({
	cartId: Joi.number().integer().positive().required(),
	cartItemId: Joi.number().integer().positive().required()
});

export const updateCartQuantitiesBodySchema = Joi.object({
	quantity: Joi.number().integer().positive().required()
});
