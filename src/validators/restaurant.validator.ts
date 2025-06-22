import Joi from 'joi';

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

export const listTopRatedRestaurantsQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).max(100).default(20),
	cursor: Joi.string().optional(),
	cuisines: Joi.array().items(Joi.number().integer().min(1)).single().optional()
});
