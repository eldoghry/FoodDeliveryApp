import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { CustomerController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { customerAddressBodySchema, customerAddressParamsSchema } from '../validators/customer.validator';

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
 * 		    - This address does not belong to the specified customer
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
 *       400:
 *         description: |
 *          - address ID is required
 *          - address ID must be a number
 *          - address ID must be an integer
 * 		    - This address does not belong to the specified customer
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

export default CustomerRouter;
