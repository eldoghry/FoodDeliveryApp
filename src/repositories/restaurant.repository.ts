import { AppDataSource } from '../config/data-source';
import { Brackets, In, Repository } from 'typeorm';
import { ListRecommendedRestaurantsFilterDto, ListRestaurantsFilterDto, ListTopRatedRestaurantsFilterDto, RestaurantResponseDto, SearchRestaurantsQueryDto } from '../dtos/restaurant.dto';
import {
	Restaurant,
	RestaurantRelations,
	RestaurantStatus,
	Chain,
	Cuisine,
	ChainRelations
} from '../models';
import { normalizeString } from '../utils/helper';

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

	async getChainBy(filter: { chainId?: number, name?: string, commercialRegistrationNumber?: string, vatNumber?: string, relations?: ChainRelations[] }): Promise<Chain | null> {
		const { relations, ...whereOptions } = filter
		return await this.chainRepo.findOne({
			where: whereOptions,
			relations: relations || []
		});
	}

	async updateChain(chainId: number, data: Partial<Chain>): Promise<Chain | null> {
		await this.chainRepo.update(chainId, data);
		return await this.getChainBy({ chainId, relations: ['restaurants'] });
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
		return await this.getRestaurantBy({ restaurantId: restaurant.restaurantId });
	}

	async getRestaurantBy(filter: { restaurantId?: number; userId?: number; name?: string; relations?: RestaurantRelations[] }): Promise<Restaurant | null> {
		const { relations, ...whereOptions } = filter;
		return await this.restaurantRepo.findOne({
			where: whereOptions,
			relations: relations || []
		});
	}

	async getDetailedActiveRestaurantView(restaurantId: number): Promise<any | null> {
		const restaurant = await this.restaurantRepo
			.createQueryBuilder('restaurant')
			.leftJoinAndSelect('restaurant.chain', 'chain')
			.leftJoinAndSelect('restaurant.cuisines', 'cuisines')
			.leftJoinAndSelect('restaurant.menu', 'menu', 'menu.isActive = :menuActive', {
				menuActive: true
			})
			.leftJoinAndSelect('menu.categories', 'category', 'category.isActive = :categoryActive', {
				categoryActive: true
			})
			.leftJoinAndSelect('category.items', 'item', 'item.isAvailable = :itemAvailable', {
				itemAvailable: true
			})
			.where('restaurant.restaurantId = :restaurantId', { restaurantId })
			.groupBy('restaurant.restaurantId')
			.addGroupBy('chain.chainId')
			.addGroupBy('cuisines.cuisineId')
			.addGroupBy('menu.menuId')
			.addGroupBy('category.categoryId')
			.addGroupBy('item.itemId')
			.take(1)
			.getOne();
		return restaurant;
	}	

	// Base query builder method (depends on geoLocation)
	private createBaseRestaurantQuery(query: { lat: number; lng: number }) {
			// Step 1: Filter restaurants by geolocation
			const filteredRestaurantQB = this.restaurantRepo.createQueryBuilder('restaurant')
				.where('restaurant.isActive = :isActive', { isActive: true })
				.andWhere('restaurant.status NOT IN (:...excludedStatuses)', {
					excludedStatuses: [RestaurantStatus.pause],
				})
				.andWhere(`
					ST_DWithin(
						restaurant.geo_location,
						ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
						restaurant.max_delivery_distance
					)
				`)
				.setParameters({ lat: query.lat, lng: query.lng });
		
			// Step 2: Prefilter restaurant_cuisine using filtered restaurant ids
			const restaurantCuisineSubquery = AppDataSource
				.createQueryBuilder()
				.select(['rc.restaurant_id AS restaurantId','rc.cuisine_id AS cuisineId'])
				.from('restaurant_cuisine', 'rc')
				.where(`rc.restaurant_id IN (${filteredRestaurantQB.clone().select('restaurant.restaurantId').getQuery()})`)
				.setParameters(filteredRestaurantQB.getParameters());
		
			// Step 3: Join everything in a final query
			const finalQB = filteredRestaurantQB
				.select([
					'restaurant.restaurantId',
					'restaurant.name',
					'restaurant.email',
					'restaurant.phone',
					'restaurant.chainId',
					'restaurant.logoUrl',
					'restaurant.location',
					'restaurant.geoLocation',
					'restaurant.maxDeliveryDistance',
					'restaurant.status',
					'restaurant.totalRating',
					'restaurant.ratingCount',
					'restaurant.averageRating',
					'restaurant.createdAt',
					'cuisine.cuisineId',
					'cuisine.name',
				])
				.innerJoin(
					`(${restaurantCuisineSubquery.getQuery()})`,
					'rc',
					'rc.restaurantId = restaurant.restaurantId'
				)
				.innerJoin('cuisine', 'cuisine', 'cuisine.cuisineId = rc.cuisineId')
				.setParameters(restaurantCuisineSubquery.getParameters())
				

				console.log(finalQB.getQuery());
			return finalQB;		
	}

	async getFilteredRestaurants(filter: ListRestaurantsFilterDto): Promise<Partial<RestaurantResponseDto>[]> {
		const { lat, lng, limit, cuisines, rating, cursor } = filter;

		const queryBuilder = this.createBaseRestaurantQuery({ lat, lng })

		if (cuisines) queryBuilder.andWhere('cuisine.cuisineId IN (:...cuisinesIds)', { cuisinesIds: cuisines });
		if (rating) queryBuilder.andWhere(`restaurant.averageRating >= :rating`, { rating });
		if (cursor) queryBuilder.andWhere('restaurant.restaurantId < :cursor', { cursor });

		queryBuilder.orderBy('restaurant.restaurantId', 'DESC').take(limit + 1)

		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsSearchResults(results);
	}

	async updateRestaurant(restaurantId: number, data: Partial<Restaurant>): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, data);
		return await this.getRestaurantBy({ restaurantId });
	}

	async updateRestaurantStatus(restaurantId: number, status: RestaurantStatus): Promise<Restaurant | null> {
		await this.restaurantRepo.update(restaurantId, { status });
		return await this.getRestaurantBy({ restaurantId });
	}

	async deleteRestaurant(restaurantId: number): Promise<void> {
		await this.restaurantRepo.update(restaurantId, { isActive: false });
	}

	async getTopRatedRestaurants(filter: ListTopRatedRestaurantsFilterDto): Promise<Partial<RestaurantResponseDto>[]> {
		const { lat, lng, limit, cuisines, cursor } = filter;

		const queryBuilder = this.createBaseRestaurantQuery({ lat, lng })
		
		if (cuisines) queryBuilder.andWhere('cuisine.cuisineId IN (:...cuisinesIds)', { cuisinesIds: cuisines });

		if (cursor) queryBuilder.andWhere('restaurant.restaurantId < :cursor', { cursor });

		queryBuilder.orderBy("restaurant.averageRating", 'DESC').take(limit + 1)

		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsSearchResults(results);
	}

	async searchRestaurants(query: SearchRestaurantsQueryDto): Promise<Partial<RestaurantResponseDto>[]> {
		const restaurants = await this.searchRestaurantsByKeyword(query)
		return restaurants
	}

	async searchRestaurantsByKeyword(query: SearchRestaurantsQueryDto): Promise<Partial<RestaurantResponseDto>[]> {
		const { lat, lng, keyword, limit, cursor } = query;
		const patterns = this.handleSearchPattern(keyword);
		const queryBuilder = this.createBaseRestaurantQuery({ lat, lng });

		const exactPattern = patterns[0];
		const partialPatterns = patterns.slice(1);

		let cuisineIdsFromExactMatch: number[] = [];

		// 1. Try to find cuisines of a restaurant with an exact name match
		const exactMatch = await this.createBaseRestaurantQuery({ lat, lng })
			.andWhere('restaurant.name ILIKE :exactPattern', {
				exactPattern: `%${exactPattern}%`
			})
			.getOne();

		if (exactMatch?.cuisines?.length) {
			cuisineIdsFromExactMatch = exactMatch.cuisines.map((c: any) => c.cuisineId);
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
		const caseParams: Record<string, any> = { exactPatternCase: `%${exactPattern}%` };

		// Add exact pattern conditions
		caseConditions += `WHEN restaurant.name ILIKE :exactPatternCase THEN 0\n`;
		caseConditions += `WHEN cuisine.name ILIKE :exactPatternCase THEN 2\n`;

		// Add partial pattern conditions
		partialPatterns.forEach((pattern, index) => {
			const paramName = `patternCase${index}`;
			caseParams[paramName] = `%${pattern}%`;
			caseConditions += `WHEN restaurant.name ILIKE :${paramName} THEN ${index + 1}\n`;
			caseConditions += `WHEN cuisine.name ILIKE :${paramName} THEN ${index + 3}\n`;
		});

		// Add cuisine ID condition only if we have cuisine IDs
		if (cuisineIdsFromExactMatch.length > 0) {
			caseConditions += `WHEN cuisine.cuisineId IN (:...cuisineIdsCase) THEN ${partialPatterns.length + 10}\n`;
			caseParams.cuisineIdsCase = cuisineIdsFromExactMatch;
		}

		// Build the complete CASE statement
		const caseStatement = `
			CASE 
				${caseConditions}
				ELSE ${partialPatterns.length + 20}
			END
		`;

		const rankCase = caseStatement;
		queryBuilder.addSelect(rankCase, 'rank');

		// Set all the case parameters
		Object.keys(caseParams).forEach(key => {
			queryBuilder.setParameter(key, caseParams[key]);
		});

		// 4. Apply cursor filtering if provided
		if (cursor) {
			const [cursorRank, cursorName] = cursor.split('|');

			// Build the same CASE statement for cursor comparison (note: add () to use it inside WHERE)
			const cursorCaseStatement = `(${caseStatement})`;

			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where(`${cursorCaseStatement} > :cursorRank`, { cursorRank });
					qb.orWhere(`${cursorCaseStatement} = :cursorRank AND restaurant.name > :cursorName`, {
						cursorRank,
						cursorName,
					});
				})
			);
		}

		queryBuilder
			.orderBy('rank', 'ASC')
			.addOrderBy('restaurant.name', 'ASC')
			.take(limit + 1); // Take limit + 1 to determine if there's a next page

		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsSearchResults(results);
	}

	async getRecommendedRestaurants(filter: ListRecommendedRestaurantsFilterDto): Promise<Partial<RestaurantResponseDto>[]> {
		const { lat, lng, limit, cuisines, sort } = filter;
		const queryBuilder = this.createBaseRestaurantQuery({ lat, lng });

		if (cuisines) queryBuilder.andWhere('cuisine.cuisineId IN (:...cuisinesIds)', { cuisinesIds: cuisines });

		if (sort && sort === 'rating') {
			queryBuilder.orderBy('restaurant.averageRating', 'DESC');
		} else {
			queryBuilder.orderBy('restaurant.' + sort, 'DESC');
		}

		queryBuilder.take(limit);
		const results = await queryBuilder.getRawAndEntities();
		return this.formatRestaurantsSearchResults(results);
	}


	/* === Helper methods === */

	private handleSearchPattern(keyword: string) {
		const originalKeyword = normalizeString(keyword);

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

	private formatRestaurantsSearchResults(results: { entities: Restaurant[], raw: any[] }): Partial<RestaurantResponseDto>[] {
		const { entities, raw } = results;
		const cuisineMap: Record<number, string[]> = {};
		raw.forEach(row => {
			const restId = row.restaurant_restaurant_id;
			if (!cuisineMap[restId]) {
				cuisineMap[restId] = [];
			}
			cuisineMap[restId].push(row.cuisine_name);
		});
		const formattedRestaurants = entities.map((entity: Restaurant, index: number) => {
			return {
				...entity,
				cuisineList:cuisineMap[entity.restaurantId] || [] as string[],
				rank: raw[index].rank
			};
		});
		return formattedRestaurants;
	}

}
