import { Restaurant, RestaurantRelations } from './../models/restaurant/restaurant.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { RestaurantRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';
import { cursorPaginate } from '../utils/helper';

export class RestaurantService {
	private restaurantRepo = new RestaurantRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async getRestaurantOrFail(filter: { restaurantId?: number; userId?: number; relations?: RestaurantRelations[] }) {
		const restaurant = await this.restaurantRepo.getRestaurantBy(filter);

		if (!restaurant) throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.NOT_FOUND);

		return restaurant;
	}

	async getAllRestaurants(filter: ListRestaurantsDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getAllRestaurants({ ...filter, limit: limit + 1 });
		return cursorPaginate(restaurants, limit, 'restaurantId' as any);
	}
}
