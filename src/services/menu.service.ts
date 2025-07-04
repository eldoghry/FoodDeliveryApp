import { StatusCodes } from "http-status-codes";
import ApplicationError from "../errors/application.error";
import ErrMessages from "../errors/error-messages";
import { MenuRepository } from "../repositories";
import { Category } from "../models/menu/category.entity";
import { Transactional } from "typeorm-transactional";

export class MenuService {
	private menuRepo = new MenuRepository();

	async getMenuOrFail(restaurantId: number) {
		const menu = await this.menuRepo.getMenuByRestaurantId(restaurantId);
		if (!menu) throw new ApplicationError(ErrMessages.menu.NoActiveMenuFound, StatusCodes.BAD_REQUEST);
		return menu;
	}

	async getMenuDetails(restaurantId: number) {
		return await this.getMenuOrFail(restaurantId);
	}

	@Transactional()
	async createMenuCategory(restaurantId: number, payload: Partial<Category>) {
		const menu = await this.getMenuOrFail(restaurantId);
		return await this.menuRepo.addCategory({ ...payload, menuId: menu.menuId });
	}

    /* Validation Methods */
	

	/* Helper Methods */
    
}
