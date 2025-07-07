import Joi from 'joi';

export const categoryBodySchema = Joi.object({
	title: Joi.string().required()
}).required();

export const categoryStatusBodySchema = Joi.object({
	isActive: Joi.boolean().required()
}).required();

export const categoryParamsSchema = Joi.object({
	categoryId: Joi.number().integer().min(1).required()
}).required();

export const itemBodySchema = Joi.object({
	name: Joi.string().required(),
	imagePath: Joi.string().required(),
	description: Joi.string().required(),
	price: Joi.number().required(),
	energyValCal: Joi.number().optional(),
	notes: Joi.string().optional(),
	isAvailable: Joi.boolean().required(),
	categories: Joi.array().items(Joi.number().integer().min(1)).required()
}).required();

export const itemParamsSchema = Joi.object({
	itemId: Joi.number().integer().min(1).required()
}).required();

export const itemAvailabilityBodySchema = Joi.object({
	isAvailable: Joi.boolean().required(),
}).required();
