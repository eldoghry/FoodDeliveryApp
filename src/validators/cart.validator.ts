import Joi from 'joi';

export const addItemToCartBodySchema = Joi.object({
	restaurantId: Joi.number().integer().min(1).required(),
	itemId: Joi.number().integer().min(1).required(),
	quantity: Joi.number().integer().min(1).required()
}).required();
