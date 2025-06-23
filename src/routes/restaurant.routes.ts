import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { RestaurantController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { listRestaurantsQuerySchema, registerRestaurantBodySchema, restaurantDeactivateBodySchema, restaurantParamsSchema } from '../validators/restaurant.validator';
// import {} from '../validators/restaurant.validator';

const RestaurantRouter = Router();
const controller = new RestaurantController();

RestaurantRouter.post('/register', validateRequest({ body: registerRestaurantBodySchema }), controller.registerRestaurant.bind(controller));

RestaurantRouter.put('/:restaurantId', controller.updateRestaurant.bind(controller));
RestaurantRouter.get('/:restaurantId', validateRequest({ params: restaurantParamsSchema }), controller.viewRestaurant.bind(controller));

RestaurantRouter.get(
	'/',
	validateRequest({ query: listRestaurantsQuerySchema }),
	controller.listRestaurant.bind(controller)
);

RestaurantRouter.get('/search', controller.searchRestaurant.bind(controller));
// RestaurantRouter.post('/:restaurantId/status', controller.toggleRestaurantStatus.bind(controller));
RestaurantRouter.patch('/:restaurantId/deactivate', isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner'] }), validateRequest({ params: restaurantParamsSchema, body: restaurantDeactivateBodySchema }), controller.deactivateRestaurant.bind(controller));
RestaurantRouter.patch('/:restaurantId/activate', isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner'] }), validateRequest({ params: restaurantParamsSchema }), controller.activateRestaurant.bind(controller));

RestaurantRouter.get('/top-rated', controller.getTopRatedRestaurant.bind(controller));
RestaurantRouter.get('/recommended', controller.getTopRatedRestaurant.bind(controller));

export default RestaurantRouter; 
