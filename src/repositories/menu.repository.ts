import { AppDataSource } from '../config/data-source';
import { Menu, Category, CategoryRelations, Item, ItemRelations } from '../models';
import { Brackets, Not, Repository } from 'typeorm';

export class MenuRepository {
	private menuRepo: Repository<Menu>;
	private categoryRepo: Repository<Category>;
	private itemRepo: Repository<Item>;

	constructor() {
		this.menuRepo = AppDataSource.getRepository(Menu);
		this.categoryRepo = AppDataSource.getRepository(Category);
		this.itemRepo = AppDataSource.getRepository(Item);
	}

	// Menu operations
	async createMenu(data: Partial<Menu>): Promise<Menu> {
		const menu = this.menuRepo.create(data);
		return await this.menuRepo.save(menu);
	}

	async getMenuByRestaurantId(restaurantId: number): Promise<Menu | null> {
		return await this.menuRepo.findOne({
			where: { restaurantId },
			relations: ['categories', 'categories.items']
		});
	}

	// Menu Category operations
	async addCategory(data: Partial<Category>): Promise<Category> {
		const category = this.categoryRepo.create(data);
		return await this.categoryRepo.save(category);
	}

	async updateCategory(categoryId: number, data: Partial<Category>): Promise<Category | null> {
		await this.categoryRepo.update(categoryId, data);
		return await this.getCategoryById(categoryId);
	}

	async getCategories(menuId: number): Promise<Category[]> {
		return await this.categoryRepo.find({
			where: { menuId },
			relations: ['items']
		});
	}

	async getCategoryBy(filter: {
		menuId?: number;
		categoryId?: number;
		title?: string;
		relations?: CategoryRelations[];
	}): Promise<Category | null> {
		const { relations, ...whereOptions } = filter;
		return await this.categoryRepo.findOne({
			where: whereOptions,
			relations: relations || []
		});
	}
	async getCategoryById(categoryId: number): Promise<Category | null> {
		return await this.getCategoryBy({ categoryId });
	}

	async deleteCategory(categoryId: number): Promise<void> {
		await this.categoryRepo.delete(categoryId);
	}

	// Item operations
	async createItem(data: Partial<Item>): Promise<Item> {
		const item = this.itemRepo.create(data);
		return await this.itemRepo.save(item);
	}

	async getItemById(filter: { itemId: number; relations?: ItemRelations[] }): Promise<Item | null> {
		return await this.itemRepo.findOne({
			where: { itemId: filter.itemId },
			relations: filter.relations || []
		});
	}

	async updateItem(itemId: number, data: Partial<Item>): Promise<Item | null> {
		// Save the updated item data (note: use save here to can update categories for item specified)
		return await this.itemRepo.save({ itemId, ...data });
	}

	async setItemAvailability(itemId: number, isAvailable: boolean): Promise<Item | null> {
		await this.itemRepo.update(itemId, { isAvailable });
		return this.getItemById({ itemId });
	}

	async getDeletedItems(restaurantId: number): Promise<Item[]> {
		// TODO: use restaurantId instead if relation
		const queryBuilder = this.itemRepo
			.createQueryBuilder('item')
			.innerJoinAndSelect('item.categories', 'category')
			.innerJoin('category.menu', 'menu')
			.where('menu.restaurantId = :restaurantId', { restaurantId: restaurantId })
			.withDeleted()
			.where('item.deletedAt < :deletedAt', { deletedAt: new Date() });

		return await queryBuilder.getMany();
	}

	async deleteItem(itemId: number) {
		await this.itemRepo.softDelete(itemId);
	}

	async searchItemsInMenu(restaurantId: number, query: any) {
		const queryBuilder = this.itemRepo
			.createQueryBuilder('item')
			.innerJoinAndSelect('item.categories', 'category')
			.innerJoin('category.menu', 'menu')
			.where('menu.restaurantId = :restaurantId', { restaurantId })
			.andWhere('category.isActive = :isActive', { isActive: true })
			.andWhere('item.isAvailable = :isAvailable', { isAvailable: true })
			.andWhere(
				new Brackets((qb) => {
					qb.where('item.name ILIKE :keyword', { keyword: `%${query.keyword}%` }).orWhere(
						'item.description ILIKE :keyword',
						{ keyword: `%${query.keyword}%` }
					);
				})
			)
			.orderBy('item.name', 'ASC');

		const result = await queryBuilder.getMany();
		return result;
	}

	async getAvailableItems(): Promise<Item[]> {
		return await this.itemRepo.find({
			where: { isAvailable: true }
		});
	}

	async getItemsByCategory(categoryId: number): Promise<Item[]> {
		const category = await this.categoryRepo.findOne({
			where: { categoryId },
			relations: ['items']
		});

		return category?.items || [];
	}

	async getItemsByMenu(menuId: number): Promise<Item[]> {
		const menu = await this.menuRepo.findOne({
			where: { menuId },
			relations: ['categories', 'categories.items']
		});
		return menu?.categories.flatMap((category) => category.items) || [];
	}
}
