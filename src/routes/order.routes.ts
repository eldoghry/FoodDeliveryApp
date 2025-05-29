import { Order } from './../models/order/order.entity';
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { OrderController } from '../controllers';
import { isCustomer } from '../middlewares/isCustomer.middleware';
import { checkoutBodySchema, updateOrderStatusBodySchema, updateOrderStatusParamsSchema } from '../validators/order.validator';
import { isRestaurant } from '../middlewares/isRestaurant.middleware';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post(
	'/checkout',
	isAuthenticated,
	isCustomer,
	validateRequest({ body: checkoutBodySchema }),
	// isRestaurantAvailable,
	controller.placeOrder.bind(controller)
);

/**
 * @swagger
 * /orders/{order_id}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
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
 *               $ref: '#/components/schemas/OrderStatusLog'
 *       400:
 *         description: |
 *           Invalid request body.
 *           - Status is required
 *           - Status must be a string
 *           - Status must be one of the following: [initiated, pending, confirmed, onTheWay, canceled, delivered, failed]
 *           - Invalid order status transition from current status to new status
 *           - Invalid actor for order status transition from current status to new status
 *           - Actor is not allowed to cancel an order in current status
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
	validateRequest({ params: updateOrderStatusParamsSchema, body: updateOrderStatusBodySchema }),
	controller.updateOrderStatus.bind(controller)
)

export default OrderRouter;
