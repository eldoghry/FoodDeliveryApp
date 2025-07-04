import { AppDataSource } from '../config/data-source';
import { Menu } from '../models/menu/menu.entity';
import { Category } from '../models/menu/category.entity';
import { Item } from '../models/menu/item.entity';
import { Repository } from 'typeorm';

export class MenuRepository {
	private menuRepo: Repository<Menu>;
	private categoryRepo: Repository<Category>;
	private itemRepo: Repository<Item>;

	constructor() {
		this.menuRepo = AppDataSource.getRepository(Menu);
		this.itemRepo = AppDataSource.getRepository(Item);
		this.categoryRepo = AppDataSource.getRepository(Category);
	}

	// Menu operations
	async createMenu(data: Partial<Menu>): Promise<Menu> {
		const menu = this.menuRepo.create(data);
		return await this.menuRepo.save(menu);
	}

	async getMenuById(menuId: number): Promise<Menu | null> {
		return await this.menuRepo.findOne({
			where: { menuId }
		});
	}

	async updateMenu(menuId: number, data: Partial<Menu>): Promise<Menu | null> {
		await this.menuRepo.update(menuId, data);
		return await this.getMenuById(menuId);
	}

	async deleteMenu(menuId: number): Promise<void> {
		await this.menuRepo.update(menuId, { isActive: false });
	}

	// Menu Category operations
	async addCategory(data: Partial<Category>): Promise<Category> {
		const category = this.categoryRepo.create(data);
		return await this.categoryRepo.save(category);
	}

	async getCategories(categoryId: number): Promise<Category[]> {
		return await this.categoryRepo.find({
			where: { categoryId },
			relations: ['items']
		});
	}

	async getCategoryById(categoryId: number): Promise<Category | null> {
		return await this.categoryRepo.findOne({
			where: { categoryId },
			relations: ['items']
		});
	}

	// Item operations
	async createItem(data: Partial<Item>): Promise<Item> {
		const item = this.itemRepo.create(data);
		return await this.itemRepo.save(item);
	}

	async getItemById(itemId: number): Promise<Item | null> {
		return await this.itemRepo.findOne({
			where: { itemId }
		});
	}

	async updateItem(itemId: number, data: Partial<Item>): Promise<Item | null> {
		await this.itemRepo.update(itemId, data);
		return await this.getItemById(itemId);
	}

	async deleteItem(itemId: number): Promise<void> {
		await this.itemRepo.update(itemId, { isAvailable: false });
	}

	async searchItems(query: string): Promise<Item[]> {
		return await this.itemRepo
			.createQueryBuilder('item')
			.where('item.name ILIKE :query', { query: `%${query}%` })
			.andWhere('item.isAvailable = :isAvailable', { isAvailable: true })
			.getMany();
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
