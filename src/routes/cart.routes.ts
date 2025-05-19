import { Router } from 'express';
import { CartController } from '../controllers';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createCartBodySchema, removeItemSchema, checkoutSchema } from '../validators/cart.validator';
import { CheckoutController } from '../controllers/checkout.controller';

const CartRouter = Router();
const cartController = new CartController();
const checkoutController = new CheckoutController();
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management APIs
 */

// Assuming user is logged in
// TODO: Implement Auth middlewares

/**
 * @swagger
 * /cart/item/{cartItemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: Removes a specific menu item from the user's shopping cart and updates cart totals
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to remove
 *     responses:
 *       200:
 *         description: Item successfully removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/globalResponse'
 *       400:
 *         description: Bad Request - Cart is not active
 *       404:
 *         description: Not Found - Cart item or cart not found
 */

CartRouter.delete(
	'/item/:cartItemId',
	validateRequest({ params: removeItemSchema }),
	cartController.removeItem.bind(cartController)
);

CartRouter.post(
	'/checkout',
	validateRequest({ body: checkoutSchema }),
	checkoutController.checkout.bind(checkoutController)
);

export default CartRouter;
