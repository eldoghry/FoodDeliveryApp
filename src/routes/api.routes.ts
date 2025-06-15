import { Router } from 'express';
import AppRouter from './app.routes';
import UserRouter from './user.routes';
import CartRouter from './cart.routes';
import AuthRouter from './auth.routes';
import OrderRouter from './order.routes';
import PaymentRouter from './payment.routes';
import SettingRouter from './setting.routes';
import PaymentMethodRouter from './payment_method.routes';

const ApiRouter = Router();

ApiRouter.use('/app', AppRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/user', UserRouter);
ApiRouter.use('/cart', CartRouter);
ApiRouter.use('/orders', OrderRouter);
ApiRouter.use('/payment', PaymentRouter);
ApiRouter.use('/setting', SettingRouter);
ApiRouter.use('/payment_method', PaymentMethodRouter);

export default ApiRouter;
