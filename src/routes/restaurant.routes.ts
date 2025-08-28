import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { RestaurantController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import {
	listRecommendedRestaurantsQuerySchema,
	listRestaurantsQuerySchema,
	listTopRatedRestaurantsQuerySchema,
	registerRestaurantBodySchema,
	restaurantDeactivateBodySchema,
	restaurantParamsSchema,
	restaurantStatusBodySchema,
	searchRestaurantQuerySchema,
	searchItemsInMenuQuerySchema
} from '../validators/restaurant.validator';
import { customRateLimiter } from '../config/ratelimiter';

const RestaurantRouter = Router();
const controller = new RestaurantController();

RestaurantRouter.get(
	'/',
	validateRequest({ query: listRestaurantsQuerySchema }),
	controller.listRestaurant.bind(controller)
);

RestaurantRouter.post('/register', customRateLimiter(3, 86400, true), validateRequest({ body: registerRestaurantBodySchema }), controller.registerRestaurant.bind(controller));
RestaurantRouter.get('/search', validateRequest({ query: searchRestaurantQuerySchema }), controller.searchRestaurant.bind(controller));
RestaurantRouter.get('/top-rated', validateRequest({ query: listTopRatedRestaurantsQuerySchema }), controller.getTopRatedRestaurants.bind(controller));
RestaurantRouter.get('/recommendations', validateRequest({ query: listRecommendedRestaurantsQuerySchema }), controller.getRecommendedRestaurants.bind(controller));

RestaurantRouter.get('/:restaurantId', validateRequest({ params: restaurantParamsSchema }), controller.viewRestaurant.bind(controller));
RestaurantRouter.patch('/:restaurantId/deactivate', customRateLimiter(1, 86400, true), isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner'] }), validateRequest({ params: restaurantParamsSchema, body: restaurantDeactivateBodySchema }), controller.deactivateRestaurant.bind(controller));
RestaurantRouter.patch('/:restaurantId/activate', customRateLimiter(1, 86400, true), isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner'] }), validateRequest({ params: restaurantParamsSchema }), controller.activateRestaurant.bind(controller));
RestaurantRouter.patch('/:restaurantId/status', customRateLimiter(15, 60, true), isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }), validateRequest({ params: restaurantParamsSchema, body: restaurantStatusBodySchema }), controller.updateRestaurantStatus.bind(controller));

RestaurantRouter.get('/:restaurantId/menu/search', validateRequest({ params: restaurantParamsSchema, query: searchItemsInMenuQuerySchema }), controller.searchItemsInMenu.bind(controller));

export default RestaurantRouter;
