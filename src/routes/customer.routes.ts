import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { CustomerController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import {
	customerAddressBodySchema,
	customerAddressParamsSchema,
	customerDeactivateBodySchema,
	customerRateOrderBodySchema,
	customerRateOrderQuerySchema
} from '../validators/customer.validator';

const CustomerRouter = Router();
const controller = new CustomerController();

/**
 * @swagger
 * /customer/addresses:
 *   post:
 *     summary: Create a new address
 *     description: Create a new address for the customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressBodyRequest'
 *     responses:
 *       201:
 *         description: Address created successfully
 */
CustomerRouter.post(
	'/addresses',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ body: customerAddressBodySchema }),
	controller.createCustomerAddress.bind(controller)
);

/**
 * @swagger
 * /customer/addresses:
 *   get:
 *     summary: Get all addresses
 *     description: Get all addresses for the customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 */
CustomerRouter.get(
	'/addresses',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	controller.getCustomerAddresses.bind(controller)
);

/**
 * @swagger
 * /customer/addresses/{addressId}/default:
 *   patch:
 *     summary: Assign default address
 *     description: Assign a default address for the customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default address assigned successfully
 *       400:
 *         description: |
 *          - address ID is required
 *          - address ID must be a number
 *          - address ID must be an integer
 *          - This address does not belong to the specified customer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: |
 *          - Address not found
 *          - Customer not found
 */
CustomerRouter.patch(
	'/addresses/:addressId/default',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ params: customerAddressParamsSchema }),
	controller.assignDefaultAddress.bind(controller)
);


/**
 * @swagger
 * /customer/addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     description: Update an address for the customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressBodyRequest'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         description: |
 *          - address ID is required
 *          - address ID must be a number
 *          - address ID must be an integer
 *          - This address does not belong to the specified customer
 *          - Unable to update address — it\'s being used in a current order.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: |
 *          - Address not found
 *          - Customer not found
 */
CustomerRouter.put(
	'/addresses/:addressId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ params: customerAddressParamsSchema, body: customerAddressBodySchema }),
	controller.updateCustomerAddress.bind(controller)
);

/**
 * @swagger
 * /customer/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     description: Soft delete an address for the customer. (The address will be deleted only if it is not used in any active order.)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       400:
 *         description: |
 *          - address ID is required
 *          - address ID must be a number
 *          - address ID must be an integer
 *          - This address does not belong to the specified customer
 *          - Unable to delete address — it\'s being used in a current order.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: |
 *          - Address not found
 */
CustomerRouter.delete(
	'/addresses/:addressId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ params: customerAddressParamsSchema }),
	controller.deleteCustomerAddress.bind(controller)
);

/**
 * @swagger
 *  /customer/{orderId}/rate:
 *    post:
 *      summary: Rate an order
 *      description: Submit a rating and optional comment for a completed order.
 *      tags: [Customer]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: orderId
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the order to rate.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                rating:
 *                  type: integer
 *                  minimum: 1
 *                  maximum: 5
 *                  example: 4
 *                  description: Rating value (1-5)
 *                comment:
 *                  type: string
 *                  example: "Great food and fast delivery!"
 *                  description: Optional comment about the order
 *              required:
 *                - rating
 *      responses:
 *        200:
 *          description: Rating submitted successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Order rated successfully."
 *        400:
 *          description: Invalid input or order cannot be rated
 *        404:
 *          description: Order not found
 *        401:
 *          description: Unauthorized
 */
CustomerRouter.post(
	'/:orderId/rate',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({
		params: customerRateOrderQuerySchema,
		body: customerRateOrderBodySchema
	}),
	controller.rateOrder.bind(controller)
);

/**
 * @swagger
 *  /customer/account/deactivate:
 *    patch:
 *      summary: Deactivate customer account
 *      description: Deactivate the customer's account by customer.
 *      tags: [Customer]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DeactivateCustomerBodyRequest'
 *      responses:
 *        200:
 *          description: Customer deactivated successfully
 *        400:
 *          description: Deactivation not allowed - This customer has active order
 *        401:
 *          description: Unauthorized
 *        403:
 *          description: Forbidden
 */
CustomerRouter.patch(
	'/account/deactivate',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['customer'] }),
	validateRequest({ body: customerDeactivateBodySchema }),
	controller.deactivateCustomer.bind(controller)
);
export default CustomerRouter;
