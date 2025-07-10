import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { verifyActor } from '../middlewares/verifyActor.middleware';
import { MenuController } from '../controllers/menu.controller';
import {
	categoryBodySchema,
	categoryParamsSchema,
	categoryStatusBodySchema,
	itemAvailabilityBodySchema,
	itemBodySchema,
	itemParamsSchema
} from '../validators/menu.validator';
const MenuRouter = Router();
const controller = new MenuController();

MenuRouter.get(
	'/',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	controller.getMenuDetails.bind(controller)
);
MenuRouter.post(
	'/',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	controller.createMenu.bind(controller)
);

MenuRouter.get(
	'/categories',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	controller.getMenuCategories.bind(controller)
); // TODO: why we create this route ?

MenuRouter.post(
	'/categories',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ body: categoryBodySchema }),
	controller.createMenuCategory.bind(controller)
); // TODO: I should pass menuId, current: I can't add category to non active menu

MenuRouter.get(
	'/categories/:categoryId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: categoryParamsSchema }),
	controller.getCategoryDetails.bind(controller)
);

MenuRouter.put(
	'/categories/:categoryId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: categoryParamsSchema, body: categoryBodySchema }),
	controller.updateMenuCategory.bind(controller)
);

MenuRouter.patch(
	'/categories/:categoryId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: categoryParamsSchema, body: categoryStatusBodySchema }),
	controller.updateMenuCategoryStatus.bind(controller)
);
MenuRouter.delete(
	'/categories/:categoryId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: categoryParamsSchema }),
	controller.deleteMenuCategory.bind(controller)
);

MenuRouter.post(
	'/items',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ body: itemBodySchema }),
	controller.createMenuItem.bind(controller)
);
MenuRouter.get(
	'/items/history',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	controller.getMenuItemsHistory.bind(controller)
);

MenuRouter.put(
	'/items/:itemId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: itemParamsSchema, body: itemBodySchema }),
	controller.updateMenuItem.bind(controller)
); //TODO: should separate item operation, and menu item operation

MenuRouter.get(
	'/items/:itemId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: itemParamsSchema }),
	controller.getMenuItemDetails.bind(controller)
); // TODO: no need to validate item in belong to menu
//TODO: should separate item operation, and menu item operation

MenuRouter.delete(
	'/items/:itemId',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: itemParamsSchema }),
	controller.deleteMenuItem.bind(controller)
); //TODO: should separate item operation, and menu item operation

MenuRouter.post(
	'/items/:itemId/status',
	isAuthenticated,
	verifyActor({ allowedActorTypes: ['restaurant_owner', 'restaurant_user'] }),
	validateRequest({ params: itemParamsSchema, body: itemAvailabilityBodySchema }),
	controller.setMenuItemAvailability.bind(controller)
); //TODO: should separate item operation, and menu item operation

export default MenuRouter;
