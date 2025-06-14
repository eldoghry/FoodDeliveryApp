import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isRestaurantAvailable } from '../middlewares/isRestaurantAvailable.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { OrderController } from '../controllers';
import {
	cancelOrderBodySchema,
	checkoutBodySchema,
	getOrderDetailsParamsSchema,
	getOrdersQuerySchema,
	orderParamsSchema,
	updateOrderStatusBodySchema
} from '../validators/order.validator';
import { verifyActor } from '../middlewares/verifyActor.middleware';

const OrderRouter = Router();
const controller = new OrderController();

OrderRouter.post(
	'/checkout',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
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
	verifyActor({ allowedActorTypes: ['restaurant_user'] }),
	validateRequest({ params: orderParamsSchema, body: updateOrderStatusBodySchema }),
	controller.updateOrderStatus.bind(controller)
);

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
	verifyActor({ allowedActorTypes: ['customer', 'restaurant_user'] }),
	validateRequest({ params: orderParamsSchema, body: cancelOrderBodySchema }),
	controller.cancelOrder.bind(controller)
);

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
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ params: orderParamsSchema }),
	controller.getOrderSummary.bind(controller)
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders history
 *     description: Get orders history by customer or restaurant
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: perPage
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CustomerOrdersHistory'
 *                 - $ref: '#/components/schemas/RestaurantOrdersHistory'
 *       400:
 *         description: |
 *           - page must be a number
 *           - page must be greater than or equal to 1
 *           - perPage must be a number
 *           - perPage must be greater than or equal to 1
 *           - perPage must be less than or equal to 25
 *           - Actor id is required
 *           - ${actorType} is not allowed to get orders history
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

OrderRouter.get(
	'/',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer', 'restaurant_user'] }),
	validateRequest({ query: getOrdersQuerySchema }),
	controller.getOrdersHistory.bind(controller)
);

/**
 * @swagger
 * /api/orders/{order_id}:
 *   get:
 *     summary: Get order details by ID
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
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-05-31T19:58:19.817Z"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Order details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     restaurantId:
 *                       type: integer
 *                       example: 2
 *                     deliveryAddressId:
 *                       type: integer
 *                       example: 6
 *                     status:
 *                       type: string
 *                       enum: [initiated, pending, confirmed, onTheWay, delivered, canceled, failed]
 *                       example: "initiated"
 *                     customerInstructions:
 *                       type: string
 *                       example: "Nothing"
 *                     deliveryFees:
 *                       type: string
 *                       example: "100.70"
 *                     serviceFees:
 *                       type: string
 *                       example: "10.50"
 *                     totalAmount:
 *                       type: string
 *                       example: "111.20"
 *                     placedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-30T08:57:41.654Z"
 *                     deliveredAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2025-05-30T08:57:41.654Z"
 *                     cancellationInfo:
 *                       type: object
 *                       nullable: true
 *                       example: null
 *                     customerId:
 *                       type: integer
 *                       example: 6
 *                     orderItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderItemId:
 *                             type: integer
 *                             example: 1
 *                           orderId:
 *                             type: integer
 *                             example: 1
 *                           itemId:
 *                             type: integer
 *                             example: 1
 *                           quantity:
 *                             type: integer
 *                             example: 1
 *                           price:
 *                             type: string
 *                             example: "100.00"
 *                           totalPrice:
 *                             type: string
 *                             example: "100.00"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-31T22:44:58.767Z"
 *                           item:
 *                             type: object
 *                             properties:
 *                               itemId:
 *                                 type: integer
 *                                 example: 1
 *                               imagePath:
 *                                 type: string
 *                                 example: "https://picsum.photos/seed/b1PoBBYw/3533/3051"
 *                               name:
 *                                 type: string
 *                                 example: "Scotch Eggs1"
 *                               description:
 *                                 type: string
 *                                 example: "Our salty pork, slow-cooked to perfection, accompanied by steamed snowpea sprouts and a rich, savory gravy."
 *                               price:
 *                                 type: string
 *                                 example: "17.15"
 *                               energyValCal:
 *                                 type: string
 *                                 example: "343.87"
 *                               notes:
 *                                 type: string
 *                                 example: "Pel vacuus vallum viridis cohibeo allatus."
 *                               isAvailable:
 *                                 type: boolean
 *                                 example: false
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-30T08:57:41.654Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-30T08:57:41.654Z"
 *                     orderStatusLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderStatusLogId:
 *                             type: integer
 *                             example: 1
 *                           orderId:
 *                             type: integer
 *                             example: 1
 *                           status:
 *                             type: string
 *                             enum: [initiated, pending, confirmed, onTheWay, delivered, canceled, failed]
 *                             example: "initiated"
 *                           changeBy:
 *                             type: string
 *                             enum: [system, restaurant, payment]
 *                             example: "system"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-31T22:52:20.765Z"
 *                     restaurant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         name:
 *                           type: string
 *                           example: "Strosin and Sons"
 *                         logoUrl:
 *                           type: string
 *                           example: "https://picsum.photos/seed/04viCOk/3973/939"
 *                         bannerUrl:
 *                           type: string
 *                           example: "https://loremflickr.com/136/2135?lock=1957818696792596"
 *                     deliveryAddress:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 6
 *                         addressLine1:
 *                           type: string
 *                           example: "49110 Juniper Close"
 *                         addressLine2:
 *                           type: integer
 *                           example: 6
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-30T08:57:41.654Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-30T08:57:41.654Z"
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
OrderRouter.get(
	'/:orderId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ params: getOrderDetailsParamsSchema }),
	controller.getOrderDetails.bind(controller)
);

export default OrderRouter;
