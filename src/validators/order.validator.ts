import Joi from 'joi';
import { PaymentMethodEnum } from '../models';

export const checkoutBodySchema = Joi.object({
	restaurantId: Joi.number().integer().min(1).required(),
	// cartId: Joi.number().integer().min(1).required(),
	addressId: Joi.number().integer().min(1).required(),
	paymentMethod: Joi.string()
		.valid(...Object.values(PaymentMethodEnum))
		.required()
}).required();
