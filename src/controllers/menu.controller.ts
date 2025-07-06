import { MenuService } from "../services/menu.service";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/sendResponse";
import { Request, Response } from "express";
import { AuthorizedUser } from "../middlewares/auth.middleware";

export class MenuController {
    private menuService = new MenuService();

    async createMenu(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const data = await this.menuService.createMenu(restaurantId!);
        sendResponse(res, StatusCodes.CREATED, 'Restaurant Menu created successfully', data);
    }

    async getMenuDetails(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const data = await this.menuService.getMenuDetails(restaurantId!);
        sendResponse(res, StatusCodes.OK, 'Restaurant Menu details retrieved successfully', data);
    }

    async createMenuCategory(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const payload = req.validated?.body;
        const data = await this.menuService.createMenuCategory(restaurantId!, payload);
        sendResponse(res, StatusCodes.CREATED, 'Menu category created successfully', data);
    }

    async getCategoryDetails(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { categoryId } = req.validated?.params;
        const data = await this.menuService.getCategoryDetails(restaurantId!, categoryId);
        sendResponse(res, StatusCodes.OK, 'Menu category details retrieved successfully', data);
    }

    async updateMenuCategory(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { categoryId } = req.validated?.params;
        const payload = req.validated?.body;
        const data = await this.menuService.updateMenuCategory(restaurantId!, categoryId, payload);
        sendResponse(res, StatusCodes.OK, 'Menu category updated successfully', data);
    }

    async updateMenuCategoryStatus(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { categoryId } = req.validated?.params;
        const payload = req.validated?.body;
        const data = await this.menuService.updateMenuCategoryStatus(restaurantId!, categoryId, payload);
        sendResponse(res, StatusCodes.OK, 'Menu category status updated successfully', data);
    }

    async getMenuCategories(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const data = await this.menuService.getMenuCategories(restaurantId!);
        sendResponse(res, StatusCodes.OK, 'Menu categories retrieved successfully', data);
    }

    async deleteMenuCategory(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { categoryId } = req.validated?.params;
        await this.menuService.deleteMenuCategory(restaurantId!, categoryId);
        sendResponse(res, StatusCodes.OK, 'Menu category deleted successfully');
    }

    async createMenuItem(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const payload = req.validated?.body; 
        const data = await this.menuService.createMenuItem(restaurantId!, payload);
        sendResponse(res, StatusCodes.CREATED, 'Menu item created successfully', data);
    }

    async updateMenuItem(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { itemId } = req.validated?.params;
        const payload = req.validated?.body;
        const data = await this.menuService.updateMenuItem(restaurantId!, itemId, payload);
        sendResponse(res, StatusCodes.OK, 'Menu item updated successfully', data);
    }

    async getMenuItemDetails(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { itemId } = req.validated?.params;
        const data = await this.menuService.getMenuItemDetails(restaurantId!, itemId);
        sendResponse(res, StatusCodes.OK, 'Menu item retrieved successfully', data);
    }

    async deleteMenuItem(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { itemId } = req.validated?.params;
        const data = await this.menuService.deleteMenuItem(restaurantId!, itemId);
        sendResponse(res, StatusCodes.OK, 'Menu item deleted successfully', data);
    }

    async setMenuItemAvailability(req: Request,res:Response){
        const {restaurantId} = req.user as AuthorizedUser;
        const {itemId}=req.validated?.params;
        const payload = req.validated?.body
        const data = await this.menuService.setMenuItemAvailability(restaurantId!, itemId , payload)
        sendResponse(res, StatusCodes.OK, 'Menu item Availability status updated successfully' , data)
    }

    async getMenuItemsHistory(req:Request,res:Response){
        const {restaurantId} = req.user as AuthorizedUser;
        const data = await this.menuService.getMenuItemsHistory(restaurantId!)
        sendResponse(res, StatusCodes.OK, 'Menu items History retrieved successfully' , data)
    }
}