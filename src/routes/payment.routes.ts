import { Router } from 'express';
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
