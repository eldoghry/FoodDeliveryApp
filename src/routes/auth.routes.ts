import { validateRequest } from './../middlewares/validate-request.middleware';
import { Router } from 'express';
const AuthRouter = Router();
import { AuthController } from '../controllers/auth.controller';
import {
	authCustomerRegisterBodySchema,
	authLoginBodySchema,
	authRequestOtpBodySchema,
	authVerifyOtpBodySchema,
	authResetPasswordBodySchema,
	authRestaurantOwnerRegisterBodySchema
} from '../validators/auth.validator';
import { customRateLimiter } from '../config/ratelimiter';

const controller = new AuthController();

AuthRouter.post('/login', customRateLimiter(5, 60), validateRequest({ body: authLoginBodySchema }), controller.login.bind(controller));
AuthRouter.post(
	'/register',
	customRateLimiter(10, 300),
	validateRequest({ body: authCustomerRegisterBodySchema }),
	controller.registerCustomer.bind(controller)
);

AuthRouter.post(
	'/request-otp',
	customRateLimiter(10, 300),
	validateRequest({ body: authRequestOtpBodySchema }),
	controller.requestOtp.bind(controller)
);

AuthRouter.post(
	'/verify-otp',
	customRateLimiter(5, 300),
	validateRequest({ body: authVerifyOtpBodySchema }),
	controller.verifyOtp.bind(controller)
);

AuthRouter.post(
	'/reset-password',
	customRateLimiter(5, 300),
	validateRequest({ body: authResetPasswordBodySchema }),
	controller.resetPassword.bind(controller)
);

AuthRouter.post(
	'/register-restaurant-owner',
	customRateLimiter(10, 300),
	validateRequest({ body: authRestaurantOwnerRegisterBodySchema }),
	controller.registerRestaurantOwner.bind(controller)
);

export default AuthRouter;
