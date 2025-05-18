import Joi from 'joi';

export const createCartBodySchema = Joi.object({
    
}).required();

export const getCartParamsSchema = Joi.object({
    cartId: Joi.number().min(1).required()
}).required();
