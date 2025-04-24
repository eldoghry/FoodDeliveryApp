import { Router } from 'express';
import { AppController } from '../controllers/app.controller';

const AppRouter = Router();

const controller = new AppController();

AppRouter.use('/health', controller.checkHealth.bind(controller));

export default AppRouter;
