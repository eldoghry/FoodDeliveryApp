import Joi from 'joi';

export const createCartBodySchema = Joi.object({
    
}).required();

export const clearCartSchema = Joi.object({
	cartId: Joi.number().integer().positive().required()
});
