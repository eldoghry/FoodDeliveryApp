import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
	addItemToCartBodySchema,
	clearCartParamsSchema,
	deleteCartItemParamsSchema,
	getCartParamsSchema,
	updateQuantityBodySchema,
	updateQuantityParamsSchema
} from '../validators/cart.validator';
import { customRateLimiter } from '../config/ratelimiter';

const CartRouter = Router();
const controller = new CartController();


/**
 * @swagger
 * /cart/items:
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
	'/items',
	customRateLimiter(20, 60, true),
	isAuthenticated,
	validateRequest({ body: addItemToCartBodySchema }),
	isRestaurantAvailable,
	controller.addItem.bind(controller)
);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Retrieve a specific cart
 *     description: Fetches the details of a customer's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved cart details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/viewCartResponse'
 *       400:
 *         description: Invalid cart ID or cart item ID.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Cart not found or cart item not found.
 */
CartRouter.get(
	'/',
	isAuthenticated,
	controller.viewCart.bind(controller)
);

/**
 * @swagger
 * /cart/items/{cartItemId}:
 *   patch:
 *     summary: Update the quantity of a cart item
 *     description: Updates the quantity of a specific cart item using the provided cart item ID.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartItemId
 *         in: path
 *         required: true
 *         description: The ID of the cart item.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       description: The quantity of the item to update.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemQuantityBody'
 *     responses:
 *       200:
 *         description: Successfully updated cart item quantity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *       400:
 *         description: |
 *           Invalid request body.
 *           - Quantity is required
 *           - Quantity must be a number
 *           - Quantity must be at least 1
 *           - Quantity must be an integer
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Cart or cart item not found.
 *       500:
 *         description: Failed to update cart item.
 */

CartRouter.patch(
	'/items/:cartItemId',
	customRateLimiter(20, 60, true),
	isAuthenticated,
	validateRequest({ params: updateQuantityParamsSchema, body: updateQuantityBodySchema }),
	controller.updateQuantity.bind(controller)
);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear all items from a cart
 *     description: Removes all items from the customer's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Cart not found.
 *       500:
 *         description: Failed to clear cart.
 */
CartRouter.delete(
	'/',
	customRateLimiter(10, 60, true),
	isAuthenticated,
	controller.clearCart.bind(controller)
);

/**
 * @swagger
 * /api/v1/cart/items/{cartItemId}:
 *   delete:
 *     summary: Delete a specific item from the cart
 *     description: Removes a specific item from the customer's cart using the cart item ID.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cartItemId
 *         in: path
 *         required: true
 *         description: The ID of the cart item to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cart item deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Cart or cart item not found.
 *       500:
 *         description: Failed to delete cart item.
 */
CartRouter.delete(
	'/items/:cartItemId',
	customRateLimiter(20, 60, true),
	isAuthenticated,
	validateRequest({ params: deleteCartItemParamsSchema }),
	controller.deleteCartItem.bind(controller)
);

export default CartRouter;
