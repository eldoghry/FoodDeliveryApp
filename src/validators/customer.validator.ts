import Joi from 'joi';

export const customerAddressBodySchema = Joi.object({
	customerId: Joi.number().min(1).required(),
	label: Joi.string().max(50),
	city: Joi.string().min(2).max(255).required(),
	area: Joi.string().min(2).max(255).required(),
	street: Joi.string().min(2).max(500).required(),
	building: Joi.string().min(1).max(50).required(),
	floor: Joi.string().min(1).max(50).required(),
	coordinates: Joi.object({
		lat: Joi.number().min(-90).max(90).required(),
		lng: Joi.number().min(-180).max(180).required()
	}).required()
}).required();
