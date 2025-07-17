import { validateRequest } from './../middlewares/validate-request.middleware';
import { Router } from 'express';
const AuthRouter = Router();
import { AuthController } from '../controllers/auth.controller';
import { authCustomerRegisterBodySchema, authLoginBodySchema } from '../validators/auth.validator';

const controller = new AuthController();

AuthRouter.post('/login', validateRequest({ body: authLoginBodySchema }), controller.login.bind(controller));
AuthRouter.post(
	'/register',
	validateRequest({ body: authCustomerRegisterBodySchema }),
	controller.registerCustomer.bind(controller)
);
// AuthRouter.post('/register-restaurant-owner', validateRequest({ body: authLoginBodySchema }), controller.registerRestaurantOwner.bind(controller));

export default AuthRouter;
