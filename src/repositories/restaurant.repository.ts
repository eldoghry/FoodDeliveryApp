import { AppDataSource } from '../config/data-source';
import { Restaurant, RestaurantRelations } from '../models/restaurant/restaurant.entity';
import { Brackets, In, Not, Repository } from 'typeorm';
import { RestaurantStatus } from '../models/restaurant/restaurant.entity';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';
import { Chain } from '../models/restaurant/chain.entity';
import { Cuisine } from '../models/restaurant/cuisine.entity';

export class RestaurantRepository {
	private restaurantRepo: Repository<Restaurant>;
	private chainRepo: Repository<Chain>;
	private cuisineRepo: Repository<Cuisine>;

	constructor() {
		this.restaurantRepo = AppDataSource.getRepository(Restaurant);
		this.chainRepo = AppDataSource.getRepository(Chain);
		this.cuisineRepo = AppDataSource.getRepository(Cuisine);
	}

	async createChain(data: Partial<Chain>): Promise<Chain> {
		const chain = this.chainRepo.create(data);
		return await this.chainRepo.save(chain);
	}

	async getChainById(chainId: number): Promise<Chain | null> {
		return await this.chainRepo.findOne({
			where: { chainId },
			relations: ['restaurants']
		});
	}

	async getChainByName(name: string): Promise<Chain | null> {
		return await this.chainRepo.findOne({ where: { name } });
	}

	async getChainByCommercialRegistrationNumber(commercialRegistrationNumber: string): Promise<Chain | null> {
		return await this.chainRepo.findOne({ where: { commercialRegistrationNumber } });
	}

	async getChainByVatNumber(vatNumber: string): Promise<Chain | null> {
		return await this.chainRepo.findOne({ where: { vatNumber } });
	}

	async updateChain(chainId: number, data: Partial<Chain>): Promise<Chain | null> {
		await this.chainRepo.update(chainId, data);
		return await this.getChainById(chainId);
	}

	async deleteChain(chainId: number): Promise<void> {
		await this.chainRepo.delete(chainId);
	}

	async getCuisines(cuisines: number[]) {
		const cuisineEntities = await this.cuisineRepo.findBy({
			cuisineId: In(cuisines)
		});
		return cuisineEntities;
	}

	async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant | null> {
		const restaurant = this.restaurantRepo.create(data);
		await this.restaurantRepo.save(restaurant);
		return await this.getRestaurantById(restaurant.restaurantId);
	}

	async getRestaurantBy(filter: { restaurantId?: number; userId?: number; name?: string; relations?: RestaurantRelations[] }) {
		const { relations, ...whereOptions } = filter;
		return await this.restaurantRepo.findOne({
			where: whereOptions,
			relations: relations
		});
	}

	async getRestaurantById(restaurantId: number): Promise<Restaurant | null> {
		return this.getRestaurantBy({ restaurantId });
	}

	async getRestaurantByName(name: string): Promise<Restaurant | null> {
		return this.getRestaurantBy({ name });
	}

	async getRestaurantByFilteredRelations(restaurantId: number) {
		return this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.chain', 'chain')
			.leftJoinAndSelect('restaurant.ratings', 'ratings')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisines')
			.leftJoinAndSelect('restaurant.menus', 'menu', 'menu.isActive = :menuActive', {
				menuActive: true
			})
			.leftJoinAndSelect('menu.menuCategories', 'menuCategory')
			.leftJoinAndSelect('menuCategory.category', 'category', 'category.isActive = :categoryActive', {
				categoryActive: true
			})
			.leftJoinAndSelect('category.items', 'item', 'item.isAvailable = :itemAvailable', {
				itemAvailable: true
			})
			.where('restaurant.restaurantId = :restaurantId', { restaurantId })
			.getOne();
	}

	async getAllRestaurants(filter: ListRestaurantsDto): Promise<any[]> {
		const averageRating = 'COALESCE(ROUND(AVG(ratings.rating),2),0)';

		const query = this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoin('restaurant.ratings', 'ratings')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisines')
			.addSelect('COALESCE(ROUND(AVG(ratings.rating), 2), 0)', 'averageRating')
			.addSelect('COUNT(ratings.rating)', 'ratingCount')
			.where('restaurant.isActive = :isActive', { isActive: true });

		if (filter?.search) {
			query.andWhere('restaurant.name ILIKE :search', { search: `%${filter.search}%` });
		}

		if (filter?.cuisines) {
			query.andWhere('cuisines.cuisineId IN (:...cuisinesIds)', { cuisinesIds: filter.cuisines });
		}

		if (filter?.rating) query.having(`${averageRating} >= :rating`, { rating: filter.rating });

		if (filter?.cursor) query.andWhere('restaurant.restaurantId < :cursor', { cursor: filter.cursor });
		if (filter?.limit) query.limit(filter.limit);

		// const order: 'ASC' | 'DESC' = filter?.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
		query.orderBy('restaurant.restaurantId', 'DESC');
		query.groupBy('restaurant.restaurantId');
		query.addGroupBy('cuisines.cuisineId');

		const { entities, raw } = await query.getRawAndEntities();

		return entities.map((restaurant, index) => {
			return {
				...restaurant,
				cuisines: restaurant.cuisines.map((cuisine) => ({ id: cuisine.cuisineId, name: cuisine.name })),
				averageRating: +raw[index].averageRating,
				ratingCount: raw[index].ratingCount
			};
		});
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

	// searchRestaurants
	async searchRestaurants(query: any) {
		const restaurants = await this.searchRestaurantsByKeyword(query)
		return restaurants
	}

	async searchRestaurantsByKeyword(query: any): Promise<Restaurant[]> {
		const patterns = this.handleSearchPattern(query.keyword);
		const queryBuilder = this.restaurantRepo.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisine')
			.where('restaurant.isActive = :isActive', { isActive: true })
			.andWhere('restaurant.status NOT IN (:...excludedStatuses)', { excludedStatuses: [RestaurantStatus.pause] })

		const exactPattern = patterns[0];
		const partialPatterns = patterns.slice(1);

		let cuisineIdsFromExactMatch: number[] = [];

		// 1. Try to find cuisines of a restaurant with an exact name match
		const exactMatch = await this.restaurantRepo.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisine')
			.where('restaurant.name ILIKE :exactPattern', { exactPattern: `%${exactPattern}%` })
			.andWhere('restaurant.isActive = true')
			.andWhere('restaurant.status != :excludedStatuses', { excludedStatuses: RestaurantStatus.pause })
			.getOne();

		if (exactMatch?.cuisines?.length) {
			cuisineIdsFromExactMatch = exactMatch.cuisines.map((c) => c.cuisineId);
		}

		// 2. Build the main query conditions
		queryBuilder.andWhere(new Brackets((qb) => {
			qb.where('restaurant.name ILIKE :exactPattern', { exactPattern: `%${exactPattern}%` });
			qb.orWhere('cuisine.name ILIKE :exactPattern', { exactPattern: `%${exactPattern}%` });
			partialPatterns.forEach((pattern, index) => {
				const paramName = `pattern${index}`;
				qb.orWhere(`restaurant.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` });
				qb.orWhere(`cuisine.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` });
			});

			if (cuisineIdsFromExactMatch.length > 0) {
				qb.orWhere('cuisine.cuisineId IN (:...cuisineIds)', { cuisineIds: cuisineIdsFromExactMatch });
			}
		}));

		// 3. Ordering: exact match first
		queryBuilder.orderBy(`
				CASE 
					WHEN restaurant.name ILIKE :exactPattern THEN 0
					WHEN restaurant.name ILIKE :partialPattern THEN 1
					WHEN cuisine.name ILIKE :exactPattern THEN 2
					WHEN cuisine.name ILIKE :partialPattern THEN 3
					WHEN cuisine.cuisineId IN (:...cuisineIds) THEN 4
					ELSE 5
				END
			`, 'ASC')
			.setParameter('exactPattern', `%${exactPattern}%`)
			.setParameter('partialPattern', `%${partialPatterns.map((p) => `%${p}%`).join('%')}%`)
			.setParameter('cuisineIds', cuisineIdsFromExactMatch);

		return await queryBuilder.getMany();
	}


	/* === Handle Search pattern === */

	private handleSearchPattern(keyword: string) {
		const originalKeyword = keyword.trim().toLowerCase();

		// Generate all possible search patterns
		const searchPatterns = [
			originalKeyword,
			originalKeyword.replace(/[^a-zA-Z]+/g, ''), // merge words by removing special chars (spaces & separators)
		];

		// Split into words (handling spaces & separators)
		const words = originalKeyword.split(/[^a-zA-Z]+/).filter((word: string) => word.length > 0);
		searchPatterns.push(...words);

		if (words.length > 1) {
			searchPatterns.push(words.join(' ')); // "Kuvalis Hansen"
			searchPatterns.push(words.join('')); // "Kuvalishansen"
		}

		// Remove duplicates
		const uniquePatterns = [...new Set(searchPatterns.filter((p: string) => p))];
		return uniquePatterns
	}

}
