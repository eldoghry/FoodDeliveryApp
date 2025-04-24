import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const UserRouter = Router();

const controller = new UserController();

UserRouter.post('/', controller.create.bind(controller));

export default UserRouter;
