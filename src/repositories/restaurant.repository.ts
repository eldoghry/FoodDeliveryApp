import { AppDataSource } from '../config/data-source';
import { Restaurant, RestaurantRelations } from '../models/restaurant/restaurant.entity';
import { Brackets, In, Not, Repository } from 'typeorm';
import { RestaurantStatus } from '../models/restaurant/restaurant.entity';
import { Chain } from '../models/restaurant/chain.entity';
import { Cuisine } from '../models/restaurant/cuisine.entity';
import { ListRecommendedRestaurantsDto, ListRestaurantsDto, ListTopRatedRestaurantsDto } from '../dtos/restaurant.dto';


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

	async getTopRatedRestaurants(filter: ListTopRatedRestaurantsDto): Promise<any[]> {
		const avgRatingExpr = 'COALESCE(ROUND(AVG(ratings.rating),2),0)';

		const query = this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoin('restaurant.ratings', 'ratings')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisines')
			.addSelect(avgRatingExpr, 'averageRating')
			.addSelect('COUNT(ratings.rating)', 'ratingCount')
			.where('restaurant.isActive = :isActive', { isActive: true });

		if (filter?.cuisines) {
			query.andWhere('cuisines.cuisineId IN (:...cuisinesIds)', { cuisinesIds: filter.cuisines });
		}

		if (filter?.cursor) query.andWhere('restaurant.restaurantId < :cursor', { cursor: filter.cursor });
		if (filter?.limit) query.limit(filter.limit);

		query.orderBy(avgRatingExpr, 'DESC');
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

	// searchRestaurants
	async searchRestaurants(query: any) {
		const restaurants = await this.searchRestaurantsByKeyword(query)
		return restaurants
	}


	// Base query builder method (for SearchRestaurants)
	private createBaseRestaurantQuery(query: any) {
		return this.restaurantRepo.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisine')
			.leftJoin('restaurant.ratings', 'ratings')
			.addSelect('COALESCE(ROUND(AVG(ratings.rating), 2), 0)', 'average_rating')
			.where('restaurant.isActive = :isActive', { isActive: true })
			.andWhere('restaurant.status NOT IN (:...excludedStatuses)', {
				excludedStatuses: [RestaurantStatus.pause]
			})
			.andWhere(`
			ST_DWithin(
			  restaurant.geoLocation,
			  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
			  restaurant."max_delivery_distance"
			)
		`)
			.setParameters({
				lat: query.lat,
				lng: query.lng,
			})
			.groupBy('restaurant.restaurantId')
			.addGroupBy('cuisine.cuisineId')
	}
	async searchRestaurantsByKeyword(query: any): Promise<any[]> {
		const patterns = this.handleSearchPattern(query.keyword);
		const queryBuilder = this.createBaseRestaurantQuery(query);

		const exactPattern = patterns[0];
		const partialPatterns = patterns.slice(1);

		let cuisineIdsFromExactMatch: number[] = [];

		// 1. Try to find cuisines of a restaurant with an exact name match
		const exactMatch = await this.createBaseRestaurantQuery(query)
			.andWhere('restaurant.name ILIKE :exactPattern', {
				exactPattern: `%${exactPattern}%`
			})
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

		// 3. Build dynamic CASE statement for ranking
		let caseConditions = '';
		let caseParams: any = {};

		// Add exact pattern conditions
		caseConditions += `WHEN restaurant.name ILIKE :exactPatternCase THEN 0\n`;
		caseConditions += `WHEN cuisine.name ILIKE :exactPatternCase THEN 2\n`;
		caseParams.exactPatternCase = `%${exactPattern}%`;

		// Add partial pattern conditions
		partialPatterns.forEach((pattern, index) => {
			const paramName = `patternCase${index}`;
			caseConditions += `WHEN restaurant.name ILIKE :${paramName} THEN ${index + 1}\n`;
			caseConditions += `WHEN cuisine.name ILIKE :${paramName} THEN ${index + 3}\n`;
			caseParams[paramName] = `%${pattern}%`;
		});

		// Add cuisine ID condition only if we have cuisine IDs
		if (cuisineIdsFromExactMatch.length > 0) {
			caseConditions += `WHEN cuisine.cuisineId IN (:...cuisineIdsCase) THEN ${partialPatterns.length + 10}\n`;
			caseParams.cuisineIdsCase = cuisineIdsFromExactMatch;
		}

		// Build the complete CASE statement
		const rankCase = `
			CASE 
				${caseConditions}
				ELSE ${partialPatterns.length + 20}
			END
		`;

		queryBuilder.addSelect(rankCase, 'rank');

		// Set all the case parameters
		Object.keys(caseParams).forEach(key => {
			queryBuilder.setParameter(key, caseParams[key]);
		});

		queryBuilder
			.orderBy('rank', 'ASC')
			.addOrderBy('restaurant.name', 'ASC');

		// 4. Apply cursor filtering if provided
		if (query.cursor) {
			const cursorRow = query.cursor.split('|');
			const cursorRank = cursorRow[0];
			const cursorName = cursorRow[1];

			// Build the same CASE statement for cursor comparison
			const cursorCaseStatement = `
				(
					CASE 
						${caseConditions}
						ELSE ${partialPatterns.length + 20}
					END
				)
			`;

			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where(`${cursorCaseStatement} > :cursorRank`, { cursorRank: cursorRank });
					qb.orWhere(`${cursorCaseStatement} = :cursorRank AND restaurant.name > :cursorName`, {
						cursorRank: cursorRank,
						cursorName: cursorName,
					});
				})
			);
		}

		// Take limit + 1 to determine if there's a next page
		queryBuilder.take(query.limit + 1);

		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsResults(results);

	}

	async getRecommendedRestaurants(filter: ListRecommendedRestaurantsDto) {
		const { lat, lng, limit, cuisines, sort } = filter;
		const queryBuilder = this.createBaseRestaurantQuery({ lat, lng });

		if (cuisines) {
			queryBuilder.andWhere('cuisine.cuisineId IN (:...cuisinesIds)', { cuisinesIds: cuisines });
		}
		
		if (sort && sort === 'rating') {
			queryBuilder.orderBy('average_rating', 'DESC');
		} else {
			queryBuilder.orderBy('restaurant.' + sort, 'DESC');
		}

		queryBuilder.take(limit);
		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsResults(results);
	}


	/* === Helper methods === */

	private handleSearchPattern(keyword: string) {
		const originalKeyword = keyword.trim().toLowerCase();

		// Generate all possible search patterns
		const searchPatterns = [
			originalKeyword,
			originalKeyword.replace(/[^a-zA-Z0-9]+/g, ''), // merge words by removing special chars (spaces & separators)
		];

		// Split into words (handling spaces & separators)
		const words = originalKeyword.split(/[^a-zA-Z0-9]+/).filter((word: string) => word.length > 0);
		searchPatterns.push(...words);

		if (words.length > 1) {
			searchPatterns.push(words.join(' ')); // "Kuvalis Hansen"
			searchPatterns.push(words.join('')); // "Kuvalishansen"
		}

		// Remove duplicates
		const uniquePatterns = [...new Set(searchPatterns.filter((p: string) => p))];
		return uniquePatterns
	}

	private formatRestaurantsResults(results: { entities: Restaurant[], raw: any[] }) {
		const { entities, raw } = results;
		return entities.map((entity: Restaurant, index: number) => {
			return {
				...entity,
				rank: raw[index].rank,
				averageRating: Number(raw[index].average_rating),
			};
		});
	}

}
