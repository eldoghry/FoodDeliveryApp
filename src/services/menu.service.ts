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

	async getMenuCategories(restaurantId: number) {
		const menu = await this.getMenuOrFail(restaurantId);
		return await this.menuRepo.getCategories(menu.menuId);
	}

	@Transactional()
	async createMenuCategory(restaurantId: number, payload: { title: string }) {
		const menu = await this.getMenuOrFail(restaurantId);
		await this.ensureCategoryTitleUniqueness(menu.menuId, payload.title!);
		return await this.menuRepo.addCategory({ ...payload, menuId: menu.menuId, isActive: true });
	}

	@Transactional()
	async updateMenuCategory(restaurantId: number, categoryId: number, payload: { title: string }) {
		await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		return await this.menuRepo.updateCategory(categoryId, payload);
	}

	@Transactional()
	async updateMenuCategoryStatus(restaurantId: number, categoryId: number, payload: { isActive: boolean }) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		this.validateCategoryStatusChange(category, payload.isActive!);
		return await this.menuRepo.updateCategory(categoryId, payload);
	}

	@Transactional()
	async deleteMenuCategory(restaurantId: number, categoryId: number) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		this.ensureCategoryIsEmpty(category);
		await this.menuRepo.deleteCategory(categoryId);
	}


    /* Validation Methods */

	private async ensureCategoryBelongsToMenu(restaurantId: number, categoryId: number) {
		const menu = await this.getMenuOrFail(restaurantId);
		const category = await this.menuRepo.getCategoryBy({ menuId: menu.menuId, categoryId, relations: ['items'] });
		if (!category) throw new ApplicationError(ErrMessages.menu.CategoryNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return category;
	}

	private async ensureCategoryTitleUniqueness(menuId: number,title: string) {
		const category = await this.menuRepo.getCategoryBy({ menuId, title });
		if (category) throw new ApplicationError(ErrMessages.menu.CategoryTitleAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private validateCategoryStatusChange(category: Category, isActive: boolean) {
		if (category.isActive === isActive){
			if(isActive === true){
				throw new ApplicationError(ErrMessages.menu.CategoryAlreadyActive, StatusCodes.BAD_REQUEST);
			}else{
				throw new ApplicationError(ErrMessages.menu.CategoryAlreadyInactive, StatusCodes.BAD_REQUEST);
			}
		}
	}

	private ensureCategoryIsEmpty(category: Category) {
		if (category.items.length > 0) {
			throw new ApplicationError(ErrMessages.menu.CategoryContainsItems, StatusCodes.BAD_REQUEST);
		}
	}

	/* Helper Methods */
    
}
