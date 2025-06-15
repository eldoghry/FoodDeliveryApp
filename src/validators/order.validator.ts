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

export const orderParamsSchema = Joi.object({
	orderId: Joi.number().integer().min(1).required()
}).required();

export const updateOrderStatusBodySchema = Joi.object({
	status: Joi.string()
		.required()
		.valid(...Object.values(OrderStatusEnum))
		.messages({
			'any.required': 'Status is required',
			'any.string': 'Status must be a string',
			'any.only': 'Invalid status'
		})
}).required();

export const cancelOrderBodySchema = Joi.object({
	reason: Joi.string().required().messages({
		'any.required': 'Reason is required'
	})
}).required();

export const getOrdersQuerySchema = Joi.object({
	perPage: Joi.number().integer().min(1).max(25).default(10),
	cursor: Joi.string().default(null)
}).required();

export const getOrderDetailsParamsSchema = Joi.object({
	orderId: Joi.number().integer().min(1).required()
}).required();
