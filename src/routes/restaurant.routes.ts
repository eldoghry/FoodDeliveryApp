import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { RestaurantController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
// import {} from '../validators/restaurant.validator';

const RestaurantRouter = Router();
const controller = new RestaurantController();

RestaurantRouter.post('/', controller.createRestaurant.bind(controller));
RestaurantRouter.put('/:restaurantId', controller.updateRestaurant.bind(controller));
RestaurantRouter.get('/:restaurantId', controller.getRestaurantById.bind(controller));
RestaurantRouter.get('/', controller.listRestaurant.bind(controller));
RestaurantRouter.get('/search', controller.searchRestaurant.bind(controller));
RestaurantRouter.post('/:restaurantId/status', controller.toggleRestaurantStatus.bind(controller));
RestaurantRouter.get('/top-rated', controller.getTopRatedRestaurant.bind(controller));
RestaurantRouter.get('/recommended', controller.getTopRatedRestaurant.bind(controller));

export default RestaurantRouter;
