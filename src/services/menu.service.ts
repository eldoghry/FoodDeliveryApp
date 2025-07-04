import { StatusCodes } from "http-status-codes";
import ApplicationError from "../errors/application.error";
import ErrMessages from "../errors/error-messages";
import { MenuRepository } from "../repositories";
import { Category, CategoryRelations } from "../models/menu/category.entity";
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

	async getCategoryDetails(restaurantId: number, categoryId: number) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		return category;
	}

	@Transactional()
	async createMenuCategory(restaurantId: number, payload: Partial<Category>) {
		const menu = await this.getMenuOrFail(restaurantId);
		return await this.menuRepo.addCategory({ ...payload, menuId: menu.menuId });
	}

	@Transactional()
	async updateMenuCategory(restaurantId: number, categoryId: number, payload: Partial<Category>) {
		await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		return await this.menuRepo.updateCategory(categoryId, payload);
	}


    /* Validation Methods */

	private async ensureCategoryBelongsToMenu(restaurantId: number, categoryId: number) {
		const menu = await this.getMenuOrFail(restaurantId);
		const category = await this.menuRepo.getCategoryBy({ menuId: menu.menuId, categoryId, relations: ['items'] });
		if (!category) throw new ApplicationError(ErrMessages.menu.CategoryNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return category;
	}

	/* Helper Methods */
    
}
