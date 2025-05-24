import { Order } from './../models/order/order.entity';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { OrderController } from '../controllers';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post(
	'/',
	isAuthenticated,
	// validateRequest({ body: {} }),
	isRestaurantAvailable,
	controller.placeOrder.bind(controller)
);

export default OrderRouter;
