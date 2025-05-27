import { AppDataSource } from '../config/data-source';
import { Restaurant } from '../models/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { Status } from '../models/restaurant/restaurant.entity';

export class RestaurantRepository {
	private restaurantRepo: Repository<Restaurant>;

	constructor() {
		this.restaurantRepo = AppDataSource.getRepository(Restaurant);
	}

	async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
		const restaurant = this.restaurantRepo.create(data);
		return await this.restaurantRepo.save(restaurant);
	}

	async getRestaurantById(restaurantId: number): Promise<Restaurant | null> {
		return await this.restaurantRepo.findOne({
			where: { restaurantId },
			relations: ['user']
		});
	}

	async getRestaurantByUserId(userId: number): Promise<Restaurant | null> {
		return await this.restaurantRepo.findOne({
			where: { userId },
			relations: ['user']
		});
	}

	async getAllRestaurants(): Promise<Restaurant[]> {
		return await this.restaurantRepo.find({
			relations: ['user'],
			where: { isActive: true }
		});
	}

	async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, data);
		return await this.getRestaurantById(restaurantId);
	}

	async updateRestaurantStatus(
		restaurantId: number,
		status: Status
	): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, { status });
		return await this.getRestaurantById(restaurantId);
	}

	async deleteRestaurant(restaurantId: number): Promise<void> {
		await this.restaurantRepo.update(restaurantId, { isActive: false });
	}

	async searchRestaurants(query: string): Promise<Restaurant[]> {
		return await this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.user', 'user')
			.where('restaurant.name ILIKE :query', { query: `%${query}%` })
			.andWhere('restaurant.isActive = :isActive', { isActive: true })
			.getMany();
	}

}
