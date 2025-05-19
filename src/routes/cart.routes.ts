import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createCartBodySchema, clearCartSchema } from '../validators/cart.validator';

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

export default CartRouter;