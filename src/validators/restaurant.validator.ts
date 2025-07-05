import Joi from 'joi';
import { RestaurantStatus } from '../models';

export const listRestaurantsQuerySchema = Joi.object({
	// page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(20),
	cursor: Joi.string().optional(),
	search: Joi.string().optional(),
	cuisines: Joi.array().items(Joi.number().integer().min(1)).single().optional(),
	rating: Joi.number().min(0).max(5).optional()
	// status: Joi.string().valid('active', 'inactive').default('active'),
	// radius: Joi.number().min(0).optional(),
	// sort: Joi.string().valid('name', 'rating', 'distance', 'created_at').default('created_at'),
	// order: Joi.string().valid('asc', 'desc').default('desc')
});

export const registerRestaurantBodySchema = Joi.object({
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	businessPhone: Joi.string().required(),
	businessEmail: Joi.string().required().email(),
	name: Joi.string().required().min(3).max(255),
	chainName: Joi.string().required().min(3).max(255),
	logoUrl: Joi.string().required(),
	bannerUrl: Joi.string().required(),
	location: Joi.object({
		city: Joi.string().required(),
		area: Joi.string().required(),
		street: Joi.string().required(),
		coordinates: Joi.object({
			lat: Joi.number().required(),
			lng: Joi.number().required()
		}).required()
	}).required(),
	commercialRegistrationNumber: Joi.string().required(),
	vatNumber: Joi.string().required(),
	cuisines: Joi.array().items(Joi.number().integer().min(1)).required()
}).required();

export const restaurantParamsSchema = Joi.object({
	restaurantId: Joi.number().integer().min(1).required()
}).required();

export const restaurantDeactivateBodySchema = Joi.object({
	reason: Joi.string().max(500).required()
}).required();

export const restaurantStatusBodySchema = Joi.object({
	status: Joi.string()
		.valid(...Object.values(RestaurantStatus))
		.required()
}).required();

export const searchRestaurantQuerySchema = Joi.object({
	keyword: Joi.string().required(),
	limit: Joi.number().integer().min(1).max(100).default(20),
	cursor: Joi.string().default(null),
	lat: Joi.number().required(),
	lng: Joi.number().required()
}).required();

export const searchItemsInMenuQuerySchema = Joi.object({
	keyword: Joi.string().required()
}).required();

export const listTopRatedRestaurantsQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(100).default(20),
	cursor: Joi.string().optional(),
	cuisines: Joi.array().items(Joi.number().integer().min(1)).single().optional()
});

export const listRecommendedRestaurantsQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(100).default(20),
	lat: Joi.number().required(),
	lng: Joi.number().required(),
	cuisines: Joi.array().items(Joi.number().integer().min(1)).single().optional(),
	sort: Joi.string().valid('rating', 'createdAt').default('createdAt'),
});