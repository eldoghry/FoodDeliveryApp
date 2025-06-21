import { Restaurant, RestaurantRelations, RestaurantStatus } from './../models/restaurant/restaurant.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { RestaurantRepository } from '../repositories';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';
import { cursorPaginate } from '../utils/helper';
import { Transactional } from 'typeorm-transactional';
import { Chain } from '../models/restaurant/chain.entity';
import { UserService } from './user.service';
import { User, UserTypeNames } from '../models';

export class RestaurantService {
	private restaurantRepo = new RestaurantRepository();
	private userService = new UserService();

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

	@Transactional()
	async createChain(payload: Partial<Chain>) {
		await this.validateChainUniqueness(payload);
		const chain = await this.restaurantRepo.createChain(payload);
		return chain;
	}

	@Transactional()
	async registerRestaurant(payload: any) {
		const userData : Partial<User> ={
			name: payload.firstName + ' ' + payload.lastName,
			phone: payload.businessPhone,
			email: payload.businessEmail,
			userTypeId: (await this.userService.getUserTypeByName(UserTypeNames.restaurant_owner))?.userTypeId
		}

		const chainData : Partial<Chain> = {
			name: payload.chainName,
			commercialRegistrationNumber: payload.commercialRegistrationNumber,
			vatNumber: payload.vatNumber
		}

		const restaurantData : Partial<Restaurant> = {
			name: payload.name,
			logoUrl: payload.logoUrl,
			bannerUrl: payload.bannerUrl,
			location: payload.location,
			cuisines: payload.cuisines,
			status: RestaurantStatus.pending,
		}

		await this.validateUserUniqueness(userData);
		const chainId = await this.resolveOrCreateChain(chainData);
		restaurantData.chainId = chainId;
		const restaurant = await this.restaurantRepo.createRestaurant(restaurantData);
		return this.formatRegisterRestaurantResponse(restaurant!);
	}


	/* === Validation Methods === */

	private async validateUserUniqueness(payload: Partial<User>) {
		await this.userService.validateEmailUniqueness(payload.email!);
		await this.userService.validatePhoneUniqueness(payload.phone!);
	}

	private async validateChainUniqueness(payload: Partial<Chain>) {
		await this.validateCommercialRegistrationNumberUniqueness(payload.commercialRegistrationNumber!);
		await this.validateVatNumberUniqueness(payload.vatNumber!);
	}

	private async validateCommercialRegistrationNumberUniqueness(commercialRegistrationNumber: string) {
		const chain = await this.restaurantRepo.getChainByCommercialRegistrationNumber(commercialRegistrationNumber);
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainCommercialRegistrationNumberAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async validateVatNumberUniqueness(vatNumber: string) {
		const chain = await this.restaurantRepo.getChainByVatNumber(vatNumber);
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainVatNumberAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	/* === Helper Methods === */

	private async getExistingChain(payload: Partial<Chain>) {
		let chain: Chain | null = null;
		if(payload.commercialRegistrationNumber){
			chain = await this.restaurantRepo.getChainByCommercialRegistrationNumber(payload.commercialRegistrationNumber!);
		}
		else if(payload.vatNumber){
			chain = await this.restaurantRepo.getChainByVatNumber(payload.vatNumber!);
		}
		else{
			chain = await this.restaurantRepo.getChainByName(payload.name!);
		}
		return chain;
	}

	private async resolveOrCreateChain(payload: Partial<Chain>) {
		const existingChain = await this.getExistingChain(payload);
		if (existingChain){
			return existingChain.chainId;
		}
		else{
			const chain = await this.createChain(payload);
			return chain.chainId;
		}
	}

	private async formatRegisterRestaurantResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			status: restaurant.status,
			submittedAt: restaurant.createdAt,
			
		};
	}

}
