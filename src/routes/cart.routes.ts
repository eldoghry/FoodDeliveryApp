import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createCartBodySchema, clearCartSchema, updateCartQuantitiesParamsSchema, updateCartQuantitiesBodySchema } from '../validators/cart.validator';

const CartRouter = Router();
const controller = new CartController();

/**
 * @swagger
 * /cart/{cartId}:
 *   delete:
 *     summary: Clear cart by removing all previously selected items
 *     description: Removing all items from a specified cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart to clear
 *     responses:
 *       200:
 *         description: Cart sucessfully cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/globalResponse'
 *       400:
 *         description: Bad Request - Cart is not active
 *       404:
 *         description: Not Found - Cart not found
 */

CartRouter.delete(
	'/:cartId',
	validateRequest({ params: clearCartSchema }),
	controller.clearCart.bind(controller)
);

/**
 * @swagger
 * /cart/{cartId}/update-cart-quantities/{cartItemId}:
 *   patch:
 *     summary: Update quantity for a specific cart item
 *     description: Updates the quantity of a given cart item in a specific cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *                 description: The new quantity for the cart item
 *     responses:
 *       200:
 *         description: Quantity successfully updated
 *       400:
 *         description: Bad Request - Invalid quantity or cart is inactive
 *       404:
 *         description: Not Found - Cart or cart item not found
 */
CartRouter.put(
	'/:cardId/update-cart-quantities/:cartItemId',
	validateRequest({ params: updateCartQuantitiesParamsSchema, body: updateCartQuantitiesBodySchema }),
	controller.updateCartQuantities.bind(controller)
)
export default CartRouter;