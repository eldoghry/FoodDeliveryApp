import { Router } from 'express';
import { CartController } from '../controllers';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createCartBodySchema, removeItemSchema } from '../validators/cart.validator';

const CartRouter = Router();
const controller = new CartController();

// Assuming user is logged in
// TODO: Implement Auth middlewares

CartRouter.delete(
	'/item/:cartItemId',
	validateRequest({ params: removeItemSchema }),
	controller.removeItem.bind(controller)
);

export default CartRouter;
