import { AppDataSource } from '../config/data-source';
import { Restaurant, RestaurantRelations } from '../models/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { RestaurantStatus } from '../models/restaurant/restaurant.entity';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';

export class RestaurantRepository {
	private restaurantRepo: Repository<Restaurant>;

	constructor() {
		this.restaurantRepo = AppDataSource.getRepository(Restaurant);
	}

	async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
		const restaurant = this.restaurantRepo.create(data);
		return await this.restaurantRepo.save(restaurant);
	}

	async getRestaurantBy(filter: { restaurantId?: number; userId?: number; relations?: RestaurantRelations[] }) {
		const { relations, ...whereOptions } = filter;
		return await this.restaurantRepo.findOne({
			where: whereOptions,
			relations: relations
		});
	}

	async getRestaurantById(restaurantId: number): Promise<Restaurant | null> {
		return this.getRestaurantBy({ restaurantId, relations: ['user'] });
	}

	async getRestaurantByUserId(userId: number): Promise<Restaurant | null> {
		return this.getRestaurantBy({ userId, relations: ['user'] });
	}

	async getAllRestaurants(filter: ListRestaurantsDto): Promise<Restaurant[]> {
		// return await this.restaurantRepo.find({
		// 	relations: ['user'],
		// 	where: { isActive: true }
		// });

		// return await this.restaurantRepo.query(
		// 	`
		// 	SELECT
		// 		restaurant.*,
		// 		COALESCE(ROUND(AVG(rating.rating),2),0) AS average_rating,
		// 		COUNT(rating.rating_id) AS rating_count
		// 	FROM restaurant
		// 	LEFT JOIN rating ON restaurant.restaurant_id = rating.restaurant_id
		// 	WHERE restaurant.is_active = true
		// 	GROUP BY restaurant.restaurant_id
		// 	ORDER BY rating_count DESC
		// 	`
		// );

		const query = this.restaurantRepo.createQueryBuilder('restaurant');
		query
			.leftJoin('restaurant.ratings', 'ratings', 'restaurant.restaurantId = ratings.restaurantId')
			.select('restaurant.*')
			.addSelect('COALESCE(ROUND(AVG(ratings.rating),2),0)', 'averageRating')
			.addSelect('count(ratings.rating_id)', 'ratingCount')
			.where('restaurant.isActive = :isActive', { isActive: true });

		if (filter?.limit) query.take(filter.limit);
		if (filter?.cursor) query.andWhere('restaurant.restaurantId > :cursor', { cursor: filter.cursor });

		if (filter?.search) {
			query.andWhere('restaurant.name ILIKE :search', { search: `%${filter.search}%` });
		}

		if (filter?.cuisine) {
			query.andWhere('restaurant.cuisine ILIKE :cuisine', { cuisine: `%${filter.cuisine}%` });
		}
		if (filter?.rating) {
			query.andWhere('restaurant.rating >= :rating', { rating: filter.rating });
		}

		// if (filter?.status) {
		// 	query.andWhere('restaurant.status = :status', { status: filter.status });
		// }

		const order: 'ASC' | 'DESC' = filter?.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
		query.orderBy('restaurant.restaurantId', order);
		query.groupBy('restaurant.restaurantId');
		return query.getRawMany();
	}

	async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, data);
		return await this.getRestaurantById(restaurantId);
	}

	async updateRestaurantStatus(restaurantId: number, status: RestaurantStatus): Promise<Restaurant | null> {
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
