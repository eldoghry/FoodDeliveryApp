import { validateRequest } from './../middlewares/validate-request.middleware';
import { Router } from 'express';
const AuthRouter = Router();
import { AuthController } from '../controllers/auth.controller';
import { authLoginBodySchema } from '../validators/auth.validator';

const controller = new AuthController();

AuthRouter.post('/login', validateRequest({ body: authLoginBodySchema }), controller.login.bind(controller));

export default AuthRouter;
