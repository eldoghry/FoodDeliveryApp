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