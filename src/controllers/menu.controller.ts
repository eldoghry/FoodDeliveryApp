import { MenuService } from "../services/menu.service";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/sendResponse";
import { Request, Response } from "express";
import { AuthorizedUser } from "../middlewares/auth.middleware";

export class MenuController {
    private menuService = new MenuService();

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
        const data = await this.menuService.getCategoryDetails(restaurantId!, categoryId!);
        sendResponse(res, StatusCodes.OK, 'Menu category details retrieved successfully', data);
    }

    async updateMenuCategory(req: Request, res: Response) {
        const { restaurantId } = req.user as AuthorizedUser;
        const { categoryId } = req.validated?.params;
        const payload = req.validated?.body;
        const data = await this.menuService.updateMenuCategory(restaurantId!, categoryId!, payload);
        sendResponse(res, StatusCodes.OK, 'Menu category updated successfully', data);
    }
}