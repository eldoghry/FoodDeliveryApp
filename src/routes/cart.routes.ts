import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { addItemToCartBodySchema } from '../validators/cart.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';

const CartRouter = Router();
const controller = new CartController();

CartRouter.post(
	'/add',
	isAuthenticated,
	validateRequest({ body: addItemToCartBodySchema }),
	isRestaurantAvailable,
	controller.addItem.bind(controller)
);

export default CartRouter;
