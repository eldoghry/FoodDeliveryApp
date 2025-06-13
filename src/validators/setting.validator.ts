import Joi from 'joi';
import { SettingKey } from '../enums/setting.enum';

export const getOneSettingByKeySchema = Joi.object({
	key: Joi.string()
		.valid(...Object.values(SettingKey))
		.insensitive()
		.required()
		.messages({
			required: 'Setting key is required.',
			'any.invalid': 'Invalid setting key.',
			'any.only': 'Setting key must be one of the predefined keys.'
		})
}).required();

export const createOneSettingSchema = Joi.object({
	key: Joi.string()
		.valid(...Object.values(SettingKey))
		.insensitive()
		.required()
		.messages({
			required: 'Setting key is required.',
			'any.invalid': 'Invalid setting key.',
			'any.only': 'Setting key must be one of the predefined keys.'
		}),
	value: Joi.any().required().messages({
		required: 'Setting value is required.'
	}),
	description: Joi.string().optional()
});
