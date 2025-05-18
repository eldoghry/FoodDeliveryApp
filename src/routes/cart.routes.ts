import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
	createCartBodySchema,
	getCartParamsSchema,
	updateQuantityBodySchema,
	updateQuantityParamsSchema
} from '../validators/cart.validator';

const CartRouter = Router();
const controller = new CartController();

// for test only
CartRouter.get('/', controller.getAllCarts.bind(controller));

/**
 * @swagger
 * /api/v1/cart/{cartId}:
 *   get:
 *     summary: Retrieve a specific cart by its ID
 *     description: Fetches the details of a cart using the provided cart ID.
 *     tags: [Cart]
 *     parameters:
 *       - name: cartId
 *         in: path
 *         required: true
 *         description: The ID of the cart to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved cart details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartId:
 *                   type: integer
 *                   description: The ID of the cart.
 *                 customerId:
 *                   type: integer
 *                   description: The ID of the customer associated with the cart.
 *                 restaurant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the restaurant.
 *                     name:
 *                       type: string
 *                       description: The name of the restaurant.
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the menu item.
 *                       name:
 *                         type: string
 *                         description: The name of the menu item.
 *                       imagePath:
 *                         type: string
 *                         description: The image path of the menu item.
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the item in the cart.
 *                       totalPriceBefore:
 *                         type: number
 *                         format: float
 *                         description: The total price before discount.
 *                       discount:
 *                         type: number
 *                         format: float
 *                         description: The discount applied to the item.
 *                       totalPriceAfter:
 *                         type: number
 *                         format: float
 *                         description: The total price after discount.
 *                 totalItems:
 *                   type: integer
 *                   description: The total number of items in the cart.
 *                 totalPrice:
 *                   type: number
 *                   format: float
 *                   description: The total price of the cart.
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the cart is active.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The creation date of the cart.
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The last update date of the cart.
 *             example:
 *               cartId: 1
 *               customerId: 1
 *               restaurant:
 *                 id: 1
 *                 name: "Restaurant 1"
 *               items:
 *                 - id: 1
 *                   name: "Item 1"
 *                   imagePath: "image1.jpg"
 *                   quantity: 2
 *                   totalPriceBefore: 10.00
 *                   discount: 2.00
 *                   totalPriceAfter: 8.00
 *               totalItems: 2
 *               totalPrice: 16.00
 *               isActive: true
 *               createdAt: "2022-01-01T00:00:00.000Z"
 *               updatedAt: "2022-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid cart ID supplied.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Cart not found.
 */
CartRouter.get('/:cartId', validateRequest({ params: getCartParamsSchema }), controller.viewCart.bind(controller));

CartRouter.patch(
	'/:cartId/items/:cartItemId',
	validateRequest({ params: updateQuantityParamsSchema, body: updateQuantityBodySchema }),
	controller.updateQuantity.bind(controller)
);
export default CartRouter;
