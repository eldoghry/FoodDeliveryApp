import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createUserBodySchema, getUserParamsSchema, getUsersQuerySchema } from '../validators/user.validator';
import { PaymentController } from '../controllers/payment.controller';
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
