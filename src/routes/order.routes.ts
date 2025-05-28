import { Order } from './../models/order/order.entity';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { OrderController } from '../controllers';
import { isCustomer } from '../middlewares/isCustomer.middleware';
import { checkoutBodySchema } from '../validators/order.validator';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post(
	'/checkout',
	isAuthenticated,
	isCustomer,
	validateRequest({ body: checkoutBodySchema }),
	isRestaurantAvailable,
	controller.placeOrder.bind(controller)
);

export default OrderRouter;
