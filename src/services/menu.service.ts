import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { MenuRepository } from '../repositories';
import { Category, CategoryRelations } from '../models/menu/category.entity';
import { Transactional } from 'typeorm-transactional';
import { Item, Menu } from '../models';
import { ILike } from 'typeorm';
import { normalizeString } from '../utils/helper';

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
	async createMenu(restaurantId: number) {
		const menu = await this.menuRepo.getMenuByRestaurantId(restaurantId);
		if (!menu) {
			const payload = {
				restaurantId,
				isActive: true
			};
			await this.menuRepo.createMenu(payload);
		} else {
			throw new ApplicationError(ErrMessages.menu.MenuAlreadyExist, StatusCodes.BAD_REQUEST);
		}
	}

	// Category CRUD Methods

	async getCategoryDetails(restaurantId: number, categoryId: number) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId);
		return category;
	}

	async getMenuCategories(restaurantId: number) {
		// TODO: I can get categories without getting menu
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
		const menu = await this.getMenuOrFail(restaurantId);
		await this.ensureCategoryTitleUniqueness(menu.menuId, payload.title!);
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

	// Item CRUD Methods
	async getMenuItemDetails(restaurantId: number, itemId: number) {
		const existingItem = await this.ensureItemBelongsToMenu(restaurantId, itemId);
		return this.formateItemResponse(existingItem!);
	}

	@Transactional()
	async createMenuItem(restaurantId: number, payload: Partial<Item>) {
		const itemPayload = await this.buildItemPayload(restaurantId, payload);
		const item = await this.menuRepo.createItem(itemPayload);
		return this.formateItemResponse(item);
	}

	@Transactional()
	async updateMenuItem(restaurantId: number, itemId: number, payload: Partial<Item>) {
		await this.ensureItemBelongsToMenu(restaurantId, itemId);
		const itemPayload = await this.buildItemPayload(restaurantId, { itemId, ...payload });
		const item = await this.menuRepo.updateItem(itemId, itemPayload);
		return this.formateItemResponse(item!);
	}

	@Transactional()
	async deleteMenuItem(restaurantId: number, itemId: number) {
		await this.ensureItemBelongsToMenu(restaurantId, itemId);
		await this.menuRepo.deleteItem(itemId);
	}

	@Transactional()
	async setMenuItemAvailability(restaurantId: number, itemId: number, payload: { isAvailable: boolean }) {
		const existingItem = await this.ensureItemBelongsToMenu(restaurantId, itemId);
		this.validateItemAvailabilityChange(existingItem!, payload.isAvailable);

		const item = await this.menuRepo.setItemAvailability(itemId, payload.isAvailable);
		return this.formateItemAvailabilityResponse(item!);
	}

	async getMenuItemsHistory(restaurantId: number) {
		const deletedItems = await this.menuRepo.getDeletedItems(restaurantId);
		return deletedItems;
	}

	/* === Validation Methods === */

	// TODO: change name ex ensureCategoryBelongsToActiveMenuAndGetCategory
	private async ensureCategoryBelongsToMenu(restaurantId: number, categoryId: number) {
		const menu = await this.getMenuOrFail(restaurantId);
		const category = await this.menuRepo.getCategoryBy({ menuId: menu.menuId, categoryId, relations: ['items'] });
		if (!category) throw new ApplicationError(ErrMessages.menu.CategoryNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return category;
	}

	private async ensureCategoryTitleUniqueness(menuId: number, title: string) {
		// TODO: I should not use ILike here, because it not make us sure that title is unique
		const category = await this.menuRepo.getCategoryBy({ menuId, title: ILike(normalizeString(title)) as any });
		if (category) throw new ApplicationError(ErrMessages.menu.CategoryTitleAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private validateCategoryStatusChange(category: Category, isActive: boolean) {
		if (category.isActive === isActive) {
			if (isActive === true) {
				throw new ApplicationError(ErrMessages.menu.CategoryAlreadyActive, StatusCodes.BAD_REQUEST);
			} else {
				throw new ApplicationError(ErrMessages.menu.CategoryAlreadyInactive, StatusCodes.BAD_REQUEST);
			}
		}
	}

	private ensureCategoryIsEmpty(category: Category) {
		if (category.items.length > 0) {
			throw new ApplicationError(ErrMessages.menu.CategoryContainsItems, StatusCodes.BAD_REQUEST);
		}
	}

	private async ensureItemNameUniqueness(menu: Menu, name: string, itemId?: number) {
		const existingItem = menu.categories
			.flatMap((category) => category.items)
			.find((item) => item.itemId !== itemId && normalizeString(item.name) === normalizeString(name));

		if (existingItem) throw new ApplicationError(ErrMessages.item.ItemNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async ensureItemBelongsToMenu(restaurantId: number, itemId: number) {
		const existingItem = await this.menuRepo.getItemById({ itemId, relations: ['categories.menu'] });
		const isItemBelongsToMenu = existingItem?.categories.some(
			(category) => category.menu.restaurantId === restaurantId
		);
		if (!isItemBelongsToMenu)
			throw new ApplicationError(ErrMessages.item.ItemNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return existingItem;
	}

	private validateItemAvailabilityChange(item: Item, isAvailable: boolean) {
		if (item.isAvailable === isAvailable) {
			if (isAvailable === true) {
				throw new ApplicationError(ErrMessages.item.ItemAlreadyAvailable, StatusCodes.BAD_REQUEST);
			} else {
				throw new ApplicationError(ErrMessages.item.ItemAlreadyUnAvailable, StatusCodes.BAD_REQUEST);
			}
		}
	}

	/* === Helper Methods === */

	private formateItemResponse(item: Item) {
		return {
			itemId: item.itemId,
			name: item.name,
			imagePath: item.imagePath,
			description: item.description,
			price: item.price,
			energyValCal: item.energyValCal,
			notes: item.notes,
			isAvailable: item.isAvailable,
			categories: item.categories.map((category) => {
				return {
					categoryId: category.categoryId,
					title: category.title
				};
			}),
			menuId: item.categories[0].menuId,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		};
	}

	private formateItemAvailabilityResponse(item: Item) {
		return {
			itemId: item.itemId,
			name: item.name,
			isAvailable: item.isAvailable,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		};
	}

	private async buildItemPayload(restaurantId: number, payload: Partial<Item>) {
		const menu = await this.getMenuOrFail(restaurantId);
		if (payload.itemId) {
			await this.ensureItemNameUniqueness(menu, payload.name!, payload.itemId);
		} else {
			await this.ensureItemNameUniqueness(menu, payload.name!);
		}

		const categories = [] as Category[];
		if (payload.categories?.length) {
			// TODO: I can get list of categories by their IDs and restaurant id once, instead of querying each one
			await Promise.all(
				payload.categories?.map(async (categoryId) => {
					const category = await this.ensureCategoryBelongsToMenu(restaurantId, Number(categoryId));
					categories.push(category);
					return category;
				})
			);
		}

		const itemPayload = {
			...payload,
			categories
		};

		return itemPayload;
	}
}
