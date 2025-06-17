
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { CustomerController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { customerAddressBodySchema } from '../validators/customer.validator';

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
CustomerRouter.post('/addresses', isAuthenticated, verifyActor({ allowedActorTypes: ['customer'] }), validateRequest({ body: customerAddressBodySchema }), controller.createCustomerAddress.bind(controller));

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
CustomerRouter.get('/addresses',isAuthenticated,verifyActor({allowedActorTypes: ['customer']}),controller.getCustomerAddresses.bind(controller));

export default CustomerRouter;