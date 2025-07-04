import Joi from 'joi';

export const categoryBodySchema = Joi.object({
	title: Joi.string().required()
}).required();
