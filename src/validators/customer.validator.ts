import Joi from 'joi';

export const customerAddressBodySchema = Joi.object({
	// customerId: Joi.number().integer().min(1).required(),
	label: Joi.string().max(50),
	city: Joi.string().min(2).max(255).required(),
	area: Joi.string().min(2).max(255).required(),
	street: Joi.string().min(2).max(500).required(),
	building: Joi.string().min(1).max(50),
	floor: Joi.string().min(1).max(50),
	coordinates: Joi.object({
		lat: Joi.number().min(-90).max(90).required(),
		lng: Joi.number().min(-180).max(180).required()
	}).required(),
	isDefault: Joi.boolean()
}).required();

export const customerAddressParamsSchema = Joi.object({
	addressId: Joi.number().integer().min(1).required()
}).required();

export const customerRateOrderQuerySchema = Joi.object({
	orderId: Joi.number().integer().required()
}).required();

export const customerRateOrderBodySchema = Joi.object({
	rating: Joi.number().integer().min(1).max(5).required(),
	comment: Joi.string().max(500).optional()
}).required();


export const customerDeactivateBodySchema = Joi.object({
	reason: Joi.string().max(500).required()
}).required();
