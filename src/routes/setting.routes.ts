import { Router } from 'express';
import { AppController } from '../controllers/app.controller';
import { SettingController } from '../controllers/setting.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createOneSettingSchema, getOneSettingByKeySchema } from '../validators/setting.validator';

const SettingRouter = Router();

const controller = new SettingController();

SettingRouter.get('/:key', validateRequest({ params: getOneSettingByKeySchema }), controller.getByKey.bind(controller));
SettingRouter.get('/', controller.getAll.bind(controller));
SettingRouter.post('/', validateRequest({ body: createOneSettingSchema }), controller.upsert.bind(controller));

export default SettingRouter;
