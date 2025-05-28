import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createUserBodySchema, getUserParamsSchema, getUsersQuerySchema } from '../validators/user.validator';

const PaymentRouter = Router();
const controller = new UserController();

/**
 * @swagger
 * tags:
 *      name: Payment
 *      description: Payment Callback APIS
 */

PaymentRouter.post('/callback/paypal', controller.create.bind(controller));

export default PaymentRouter;
