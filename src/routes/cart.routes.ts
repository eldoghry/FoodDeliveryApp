import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { addItemToCartBodySchema } from '../validators/cart.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';

const CartRouter = Router();
const controller = new CartController();

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add an item to the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddItemToCart'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/messageResponse'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Restaurant not available
 */
CartRouter.post(
	'/add',
	isAuthenticated,
	validateRequest({ body: addItemToCartBodySchema }),
	isRestaurantAvailable,
	controller.addItem.bind(controller)
);

export default CartRouter;
