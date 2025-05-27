import { Router } from 'express';
import AppRouter from './app.routes';
import UserRouter from './user.routes';
import CartRouter from './cart.routes';
import AuthRouter from './auth.routes';

const ApiRouter = Router();

ApiRouter.use('/app', AppRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/user', UserRouter);
ApiRouter.use('/cart', CartRouter);
ApiRouter.use('/cart', CartRouter);

export default ApiRouter;
