import { Router } from 'express';
import { PaymentMethodController } from '../controllers';

const PaymentMethodRouter = Router();
const controller = new PaymentMethodController();

/**
 * @swagger
 * tags:
 *      name: Payment Method
 *      description: Payment Method
 */

PaymentMethodRouter.get('/', controller.getAll.bind(controller));

export default PaymentMethodRouter;
