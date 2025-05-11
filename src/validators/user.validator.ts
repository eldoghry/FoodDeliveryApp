import Joi from 'joi';

export const createUserBodySchema = Joi.object({
	firstName: Joi.string().required().min(3).max(30),
	lastName: Joi.string().required().min(3).max(30),
	email: Joi.string().required().email()
}).required();

export const getUsersQuerySchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(10)
}).required();

export const getUserParamsSchema = Joi.object({
	id: Joi.number().min(1).required()
}).required();
