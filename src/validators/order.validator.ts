import Joi from 'joi';
import { OrderStatusChangeBy, OrderStatusEnum, PaymentMethodEnum } from '../models';

export const checkoutBodySchema = Joi.object({
	restaurantId: Joi.number().integer().min(1).required(),
	// cartId: Joi.number().integer().min(1).required(),
	addressId: Joi.number().integer().min(1).required(),
	paymentMethod: Joi.string()
		.valid(...Object.values(PaymentMethodEnum))
		.required()
}).required();

export const updateOrderStatusParamsSchema = Joi.object({
	orderId: Joi.number().integer().min(1).required()
}).required();

export const updateOrderStatusBodySchema = Joi.object({
	status: Joi.string()
		.valid(...Object.values(OrderStatusEnum))
		.required().messages({
			'any.required': 'Status is required',
		})
}).required();