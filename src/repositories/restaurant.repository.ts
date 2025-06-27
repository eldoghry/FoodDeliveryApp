import { AppDataSource } from '../config/data-source';
import { Restaurant, RestaurantRelations } from '../models/restaurant/restaurant.entity';
import { In, Not, Repository } from 'typeorm';
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

	// async searchRestaurants(query: any): Promise<Restaurant[]> {
	// 	const keyword = query.keyword.replace(/[^a-zA-Z]+/g, '').toLowerCase();

	// 	return await this.restaurantRepo
	// 		.createQueryBuilder('restaurant')
	// 		.where('restaurant.name ILIKE :query', { query: `%${keyword}%` })
	// 		.andWhere('restaurant.isActive = :isActive', { isActive: true })
	// 		// .andWhere('restaurant.status = :status', { status: Not(In([RestaurantStatus.pause])) })
	// 		.orderBy('restaurant.name', 'ASC')
	// 		.getMany();
	// }

	// searchRestaurants
	async searchRestaurants(query: any) {
		let results: Restaurant[] = []
		// match exact or like name of keyword search
		// results.push(await this.searchRestaurantsByKeyword(query))
		const restaurantsByName = await this.searchRestaurantsByKeyword(query)

		// match cuisines of restaurants founded by like name of keyword search
		// const restaurantsByCuisine = await this.searchRestaurantsByCuisine(query)
		// const cuisines = restaurantsByName[0]['cuisines'].map((cuisine) => cuisine.cuisineId)
		// const restaurantsByCuisine = await this.restaurantRepo.find({ where: { cuisines: In(cuisines) } })
		// results = [...restaurantsByName, ...restaurantsByCuisine]
		return restaurantsByName
	}
    async searchRestaurantsByCuisine(query: any) {
        
    }

	async searchRestaurantsByKeyword(query: any): Promise<Restaurant[]> {
       const patterns = this.handleSearchPattern(query.keyword)
		const queryBuilder = this.restaurantRepo.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisine')
			

		patterns.forEach((pattern, index) => {
			const paramName = `query${index}`;
			if (index === 0) {
				queryBuilder.andWhere(`restaurant.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` }); // exact match restaurant name
				queryBuilder.andWhere(`cuisine.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` }); // exact match cuisine name

			} else {
				queryBuilder.orWhere(`restaurant.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` }); // partial match
				queryBuilder.orWhere(`cuisine.name ILIKE :${paramName}`, { [paramName]: `%${pattern}%` }); // partial match
			}

			queryBuilder.andWhere('restaurant.isActive = :isActive', { isActive: true });
		});

		// sort by exact match first then partial match
		queryBuilder.orderBy(`
			CASE 
				WHEN restaurant.name ILIKE :exactPattern THEN 0
				WHEN cuisine.name ILIKE :exactPattern THEN 1
				ELSE 2                                           
			END`, 'ASC')
			.setParameter('exactPattern', patterns[0]);  

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
