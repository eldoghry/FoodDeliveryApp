import Joi from 'joi';

export const customerAddressBodySchema = Joi.object({}).required();

export const customerRateOrderQuerySchema = Joi.object({
	orderId: Joi.number().integer().required()
}).required();

export const customerRateOrderBodySchema = Joi.object({
	rating: Joi.number().integer().min(1).max(5).required(),
	comment: Joi.string().max(500).optional()
}).required();
