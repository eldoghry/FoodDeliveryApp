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
AuthRouter.post(
	'/request-otp',
	customRateLimiter(1, 180000),
	validateRequest({ body: authRequestOtpBodySchema }),
	controller.requestOtp.bind(controller)
);

AuthRouter.post(
	'/verify-otp',
	validateRequest({ body: authVerifyOtpBodySchema }),
	controller.verifyOtp.bind(controller)
);

AuthRouter.post(
	'/reset-password',
	validateRequest({ body: authResetPasswordBodySchema }),
	controller.resetPassword.bind(controller)
);

export default AuthRouter;
