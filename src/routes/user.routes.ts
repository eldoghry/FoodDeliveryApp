import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createUserBodySchema, getUserParamsSchema, getUsersQuerySchema } from '../validators/user.validator';

const UserRouter = Router();

const controller = new UserController();

UserRouter.post('/', validateRequest({ body: createUserBodySchema }), controller.create.bind(controller));
UserRouter.get('/', validateRequest({ query: getUsersQuerySchema }), controller.getAll.bind(controller));
UserRouter.get('/test', controller.test.bind(controller)); // sending without validation
UserRouter.get('/:id', validateRequest({ params: getUserParamsSchema }), controller.getOne.bind(controller));

export default UserRouter;
