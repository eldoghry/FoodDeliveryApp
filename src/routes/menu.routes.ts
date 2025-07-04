import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { RestaurantController } from '../controllers';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { MenuController } from '../controllers/menu.controller';
import { categoryBodySchema } from '../validators/menu.validator';
const MenuRouter = Router();
const controller = new MenuController();

MenuRouter.get('/', isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }), controller.getMenuDetails.bind(controller));
MenuRouter.post('/categories', isAuthenticated, verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }), validateRequest({ body: categoryBodySchema }), controller.createMenuCategory.bind(controller));


export default MenuRouter;
