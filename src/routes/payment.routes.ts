import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createUserBodySchema, getUserParamsSchema, getUsersQuerySchema } from '../validators/user.validator';
import { PaymentController } from '../controllers/payment.controller';

const PaymentRouter = Router();
const controller = new PaymentController();

/**
 * @swagger
 * tags:
 *      name: Payment
 *      description: Payment Callback APIS
 */

PaymentRouter.post('/callback/paypal', controller.handlePaypalCallback.bind(controller));

export default PaymentRouter;
