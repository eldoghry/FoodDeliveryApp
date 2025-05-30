import { Order } from './../models/order/order.entity';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { OrderController } from '../controllers';
import { isCustomer } from '../middlewares/isCustomer.middleware';
import { cancelOrderBodySchema, checkoutBodySchema, orderParamsSchema, updateOrderStatusBodySchema } from '../validators/order.validator';
import { isRestaurant } from '../middlewares/isRestaurant.middleware';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post(
	'/checkout',
	isAuthenticated,
	isCustomer,
	validateRequest({ body: checkoutBodySchema }),
	isRestaurantAvailable,
	controller.checkout.bind(controller)
);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusBody'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateOrderStatusResponse'
 *       400:
 *         description: |
 *           - Status is required
 *           - Status must be a string
 *           - Invalid status: ${newStatus}
 *           - Invalid order status transition from ${currentStatus} to ${newStatus}
 *           - Invalid actor: ${actor} for order status transition from ${currentStatus} to ${newStatus}
 *           - ${actor} is not allowed to cancel an order in ${currentStatus} status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
OrderRouter.patch(
	'/:orderId/status',
	isAuthenticated,
	isRestaurant,
	validateRequest({ params: orderParamsSchema, body: updateOrderStatusBodySchema }),
	controller.updateOrderStatus.bind(controller)
)

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     description: Cancel an order by customer or restaurant
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderBody'
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateOrderStatusResponse'
 *       400:
 *         description: |
 *           - Reason is required
 *           - Reason must be a string
 *           - Actor Type is not allowed to cancel an order
 *           - Invalid order status transition from ${currentStatus} to canceled
 *           - ${actor} is not allowed to cancel an order in ${currentStatus} status
 * 
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
OrderRouter.post(
	'/:orderId/cancel',
	isAuthenticated,
	validateRequest({ params: orderParamsSchema , body: cancelOrderBodySchema }),
	controller.cancelOrder.bind(controller)
)

/**
 * @swagger
 * /orders/{orderId}/summary:
 *   get:
 *     summary: Get order summary
 *     description: Get order summary by order ID
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderSummary'
 *       400:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
OrderRouter.get(
	'/:orderId/summary',
	isAuthenticated,
	isCustomer,
	validateRequest({ params: orderParamsSchema }),
	controller.getOrderSummary.bind(controller)
)

export default OrderRouter;
