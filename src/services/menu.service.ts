import { StatusCodes } from "http-status-codes";
import ApplicationError from "../errors/application.error";
import ErrMessages from "../errors/error-messages";
import { MenuRepository } from "../repositories";
import { Category } from "../models/menu/category.entity";
import { Transactional } from "typeorm-transactional";
import { Item, OrderStatusEnum } from "../models";
import { ILike } from "typeorm";
import { normalizeString } from "../utils/helper";

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
		const existingMenu = await this.menuRepo.getMenuByRestaurantId(restaurantId)
		if (!existingMenu) {
			const payload = {
				restaurantId,
				isActive: true
			}
			await this.menuRepo.createMenu(payload)
		}
	}


	// Category CRUD Methods

	async getCategoryDetails(restaurantId: number, categoryId: number) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId, true);
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
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId, false);
		await this.ensureCategoryTitleUniqueness(category.menuId, payload.title!, categoryId);
		return await this.menuRepo.updateCategory(categoryId, payload);
	}

	@Transactional()
	async updateMenuCategoryStatus(restaurantId: number, categoryId: number, payload: { isActive: boolean }) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId, false);
		this.validateCategoryStatusChange(category, payload.isActive!);
		return await this.menuRepo.updateCategory(categoryId, payload);
	}

	@Transactional()
	async deleteMenuCategory(restaurantId: number, categoryId: number) {
		const category = await this.ensureCategoryBelongsToMenu(restaurantId, categoryId, true);
		this.ensureCategoryIsEmpty(category);
		await this.menuRepo.deleteCategory(categoryId);
	}

	// Item CRUD Methods
	async getMenuItemDetails(restaurantId: number, itemId: number) {
		const existingItem = await this.ensureItemBelongsToRestaurantMenu(restaurantId, itemId);
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
		await this.ensureItemBelongsToRestaurantMenu(restaurantId, itemId);
		await this.ensureItemInActiveOrder(itemId)
		const itemPayload = await this.buildItemPayload(restaurantId, { itemId, ...payload });
		const item = await this.menuRepo.updateItem(itemId, itemPayload);
		return this.formateItemResponse(item!);
	}

	@Transactional()
	async deleteMenuItem(restaurantId: number, itemId: number) {
		await this.ensureItemBelongsToRestaurantMenu(restaurantId, itemId);
		await this.ensureItemInActiveOrder(itemId)
		await this.menuRepo.deleteItem(itemId)
	}

	@Transactional()
	async setMenuItemAvailability(restaurantId: number, itemId: number, payload: { isAvailable: boolean }) {
		const existingItem = await this.ensureItemBelongsToRestaurantMenu(restaurantId, itemId);
		this.validateItemAvailabilityChange(existingItem!, payload.isAvailable)

		const item = await this.menuRepo.setItemAvailability(itemId, payload.isAvailable)
		return this.formateItemAvailabilityResponse(item!)
	}

	async getMenuItemsHistory(restaurantId: number) {
		return this.menuRepo.getDeletedItems(restaurantId)
	}

	/* === Validation Methods === */

	private async ensureCategoryBelongsToMenu(restaurantId: number, categoryId: number , needItems = false) {
		const menu = await this.getMenuOrFail(restaurantId);
		const category = await this.menuRepo.getCategoryBy({ menuId: menu.menuId, categoryId, relations: needItems ? ['items'] : [] });
		if (!category) throw new ApplicationError(ErrMessages.menu.CategoryNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return category;
	}

	private async ensureCategoryTitleUniqueness(menuId: number, title: string, categoryId?: number) {
		const category = await this.menuRepo.getCategoryBy({ menuId, title: ILike(normalizeString(title)) as any });
		if (category && (category.categoryId !== categoryId)) throw new ApplicationError(ErrMessages.menu.CategoryTitleAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private validateCategoryStatusChange(category: Category, isActive: boolean) {
		if (category.isActive === isActive) {
			const errorMessage = isActive
				? ErrMessages.menu.CategoryAlreadyActive
				: ErrMessages.menu.CategoryAlreadyInactive;
			throw new ApplicationError(errorMessage, StatusCodes.BAD_REQUEST);
		}
	}

	private ensureCategoryIsEmpty(category: Category) {
		if (category.items.length > 0) {
			throw new ApplicationError(ErrMessages.menu.CategoryContainsItems, StatusCodes.BAD_REQUEST);
		}
	}

	private async ensureItemNameUniqueness(restaurantId: number, name: string, itemId?: number) {
		const existingItem = await this.menuRepo.getItemBy({ restaurantId, name: ILike(normalizeString(name)) as any });
		if (existingItem && (existingItem.itemId !== itemId)) throw new ApplicationError(ErrMessages.item.ItemNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async ensureItemBelongsToRestaurantMenu(restaurantId: number, itemId: number) {
		const existingItem = await this.menuRepo.getItemBy({ itemId, restaurantId });
		if (!existingItem) throw new ApplicationError(ErrMessages.item.ItemNotBelongsToMenu, StatusCodes.BAD_REQUEST);
		return existingItem;
	}

	private validateItemAvailabilityChange(item: Item, isAvailable: boolean) {
		if (item.isAvailable === isAvailable) {
			const errorMessage = isAvailable
				? ErrMessages.item.ItemAlreadyAvailable
				: ErrMessages.item.ItemAlreadyUnAvailable;
			throw new ApplicationError(errorMessage, StatusCodes.BAD_REQUEST);
		}
	}

	private async ensureItemInActiveOrder(itemId: number) {
		const item = await this.menuRepo.getItemBy({ itemId, relations: ['ordersItem.order'] });
		const excludedStatuses = [
			OrderStatusEnum.delivered,
			OrderStatusEnum.canceled,
			OrderStatusEnum.failed
		];
		const itemInActiveOrder = item?.ordersItem?.some((orderItem) => !excludedStatuses.includes(orderItem.order.status));
		if (itemInActiveOrder) {
			throw new ApplicationError(ErrMessages.item.ItemInActiveOrder, StatusCodes.BAD_REQUEST);
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
				}
			}),
			menuId: item.categories[0].menuId,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		}
	}

	private formateItemAvailabilityResponse(item: Item) {
		return {
			itemId: item.itemId,
			name: item.name,
			isAvailable: item.isAvailable,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		}
	}


	private async buildItemPayload(restaurantId: number, payload: Partial<Item>) {
		await this.ensureItemNameUniqueness(restaurantId, payload.name!, payload.itemId)

		const categories = [] as Category[];
		if (payload.categories?.length) {
			await Promise.all(payload.categories?.map(async categoryId => {
				const category = await this.ensureCategoryBelongsToMenu(restaurantId, Number(categoryId), false);
				categories.push(category);
				return category;
			}));
		}

		const itemPayload = {
			...payload,
			restaurantId,
			categories,
		};

		return itemPayload;
	}

}
