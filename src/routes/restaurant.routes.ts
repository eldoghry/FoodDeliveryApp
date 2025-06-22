import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { RestaurantController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { listRestaurantsQuerySchema, listTopRatedRestaurantsQuerySchema } from '../validators/restaurant.validator';
// import {} from '../validators/restaurant.validator';

const RestaurantRouter = Router();
const controller = new RestaurantController();

RestaurantRouter.post('/', controller.createRestaurant.bind(controller));

RestaurantRouter.get(
	'/',
	validateRequest({ query: listRestaurantsQuerySchema }),
	controller.listRestaurant.bind(controller)
);

RestaurantRouter.get(
	'/top-rated',
	validateRequest({ query: listTopRatedRestaurantsQuerySchema }),
	controller.getTopRatedRestaurants.bind(controller)
);

RestaurantRouter.get('/search', controller.searchRestaurant.bind(controller));
RestaurantRouter.get('/recommended', controller.getRecommendedRestaurant.bind(controller));
RestaurantRouter.put('/:restaurantId', controller.updateRestaurant.bind(controller));
RestaurantRouter.get('/:restaurantId', controller.getRestaurantById.bind(controller));
RestaurantRouter.post('/:restaurantId/status', controller.toggleRestaurantStatus.bind(controller));

export default RestaurantRouter;
