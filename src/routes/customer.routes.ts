
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { CustomerController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { customerAddressBodySchema } from '../validators/customer.validator';

const CustomerRouter = Router();
const controller = new CustomerController();


CustomerRouter.post('/addresses',isAuthenticated,verifyActor({ allowedActorTypes: ['customer'] }),validateRequest({ body: customerAddressBodySchema }),controller.createCustomerAddress.bind(controller));

export default CustomerRouter;