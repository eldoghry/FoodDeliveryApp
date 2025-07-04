import {
	Restaurant,
	RestaurantApprovalStatus,
	RestaurantDeactivatedBy,
	RestaurantRelations,
	RestaurantStatus
} from './../models/restaurant/restaurant.entity';
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { RestaurantRepository } from '../repositories';
import { ListRecommendedRestaurantsDto, ListRestaurantsDto, ListTopRatedRestaurantsDto } from '../dtos/restaurant.dto';
import { cursorPaginate } from '../utils/helper';
import { Transactional } from 'typeorm-transactional';
import { Chain } from '../models/restaurant/chain.entity';
import { UserService } from './user.service';
import { User, UserTypeNames } from '../models';
import { Rating } from '../models/rating/rating.entity';
import { SettingService } from './setting.service';
import { SettingKey } from '../enums/setting.enum';
import { OrderService } from './order.service';

export class RestaurantService {
	private restaurantRepo = new RestaurantRepository();
	private userService = new UserService();
	private _orderService: OrderService | undefined = undefined;

	get orderService() {
		if (!this._orderService) {
			this._orderService = new OrderService();
		}
		return this._orderService;
	}

	async getRestaurantOrFail(filter: { restaurantId?: number; userId?: number; relations?: RestaurantRelations[] }) {
		const restaurant = await this.restaurantRepo.getRestaurantBy(filter);

		if (!restaurant) throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.NOT_FOUND);

		return restaurant;
	}

	async getAllRestaurants(filter: ListRestaurantsDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getAllRestaurants({ ...filter, limit: limit! + 1 });
		return cursorPaginate(restaurants, limit, 'restaurantId');
	}

	async getTopRatedRestaurants(filter: ListTopRatedRestaurantsDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getTopRatedRestaurants({ ...filter, limit: limit! + 1 });
		return cursorPaginate(restaurants, limit, 'restaurantId');
	}

	async getRecommendedRestaurants(filter: ListRecommendedRestaurantsDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getRecommendedRestaurants({ ...filter, limit: limit! + 1 });
		return restaurants
	}

	@Transactional()
	async createChain(payload: Partial<Chain>) {
		await this.validateChainUniqueness(payload);
		const chain = await this.restaurantRepo.createChain(payload);
		return chain;
	}

	@Transactional()
	async registerRestaurant(payload: any) {
		const userData: Partial<User> = {
			name: payload.firstName + ' ' + payload.lastName,
			phone: payload.businessPhone,
			email: payload.businessEmail,
			userTypeId: (await this.userService.getUserTypeByName(UserTypeNames.restaurant_owner))?.userTypeId
		};

		const chainData: Partial<Chain> = {
			name: payload.chainName,
			commercialRegistrationNumber: payload.commercialRegistrationNumber,
			vatNumber: payload.vatNumber
		};

		const restaurantData: Partial<Restaurant> = {
			name: payload.name,
			logoUrl: payload.logoUrl,
			bannerUrl: payload.bannerUrl,
			location: {
				city: payload.location.city,
				area: payload.location.area,
				street: payload.location.street,
			},
			geoLocation: { type: 'Point', coordinates: [payload.location.coordinates.lng, payload.location.coordinates.lat] },
			approvalStatus: RestaurantApprovalStatus.pending
		};

		await this.validateUserUniqueness(userData);

		const chain = await this.createChain(chainData);
		restaurantData.chainId = chain.chainId;

		const cuisines = await this.getRestaurantCuisines(payload.cuisines);
		restaurantData.cuisines = cuisines;

		const restaurant = await this.createRestaurant(restaurantData);
		return this.formatRegisterRestaurantResponse(restaurant!);
	}

	async viewRestaurant(restaurantId: number) {
		const restaurant = await this.restaurantRepo.getRestaurantByFilteredRelations(restaurantId);
		return this.formatViewRestaurantResponse(restaurant!);
	}

	@Transactional()
	async deactivateRestaurant(
		actorId: number,
		restaurantId: number,
		payload: Partial<Restaurant['deactivationInfo']>,
		deactivatedBy: RestaurantDeactivatedBy
	) {
		const deactivationInfo = { ...payload, deactivatedAt: new Date(), deactivatedBy };
		await this.validateRestaurantDeactivation(actorId, restaurantId);
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, {
			isActive: false,
			status: RestaurantStatus.closed,
			deactivationInfo
		});
		return this.formatActivationRestaurantResponse(restaurant!, 'deactivate');
	}

	@Transactional()
	async activateRestaurant(actorId: number, restaurantId: number, activatedBy: RestaurantDeactivatedBy) {
		await this.validateRestaurantActivation(actorId, restaurantId);

		const activationInfo = { activatedAt: new Date(), activatedBy: activatedBy };
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, {
			isActive: true,
			status: RestaurantStatus.open,
			activationInfo
		});
		return this.formatActivationRestaurantResponse(restaurant!, 'activate');
	}

	@Transactional()
	async updateRestaurantStatus(actorId: number, restaurantId: number, payload: { status: RestaurantStatus }) {
		await this.validateRestaurantBelongsToUser(actorId, restaurantId);
		await this.validateRestaurantIsActivated(restaurantId);

		if (payload.status === RestaurantStatus.closed || payload.status === RestaurantStatus.pause) {
			await this.validateRestaurantHasActiveOrders(restaurantId);
		}
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, { status: payload.status });
		return this.formatRestaurantStatusResponse(restaurant!);
	}

	async searchRestaurants(query: any) {
		const results = await this.restaurantRepo.searchRestaurants(query);
		return cursorPaginate(results, query.limit, ['rank','name']);
	}

	/* === Validation Methods === */

	private async validateUserUniqueness(payload: Partial<User>) {
		await this.userService.validateEmailUniqueness(payload.email!);
		await this.userService.validatePhoneUniqueness(payload.phone!);
	}

	private async validateChainUniqueness(payload: Partial<Chain>) {
		await this.validateChainNameUniqueness(payload.name!);
		await this.validateCommercialRegistrationNumberUniqueness(payload.commercialRegistrationNumber!);
		await this.validateVatNumberUniqueness(payload.vatNumber!);
	}

	private async validateChainNameUniqueness(name: string) {
		const chain = await this.restaurantRepo.getChainByName(name);
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async validateCommercialRegistrationNumberUniqueness(commercialRegistrationNumber: string) {
		const chain = await this.restaurantRepo.getChainByCommercialRegistrationNumber(commercialRegistrationNumber);
		if (chain)
			throw new ApplicationError(
				ErrMessages.restaurant.ChainCommercialRegistrationNumberAlreadyExists,
				StatusCodes.BAD_REQUEST
			);
	}

	private async validateVatNumberUniqueness(vatNumber: string) {
		const chain = await this.restaurantRepo.getChainByVatNumber(vatNumber);
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainVatNumberAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantNameUniqueness(name: string) {
		const restaurant = await this.restaurantRepo.getRestaurantByName(name);
		if (restaurant)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantDeactivation(actorId: number, restaurantId: number) {
		await this.validateRestaurantBelongsToUser(actorId, restaurantId);
		await this.validateRestaurantIsDeactivated(restaurantId);
		await this.validateRestaurantHasActiveOrders(restaurantId);
	}

	private async validateRestaurantActivation(actorId: number, restaurantId: number) {
		await this.validateRestaurantBelongsToUser(actorId, restaurantId);
		await this.validateRestaurantDectivatedBySystemAdmin(restaurantId);
		await this.validateRestaurantIsApproved(restaurantId);
		await this.validateRestaurantIsActive(restaurantId);
	}

	private async validateRestaurantIsApproved(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.approvalStatus !== RestaurantApprovalStatus.approved)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsNotApproved, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantDectivatedBySystemAdmin(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.deactivationInfo?.deactivatedBy === RestaurantDeactivatedBy.system)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantDectivatedBySystemAdmin, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantBelongsToUser(actorId: number, restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId, relations: ['users.restaurants'] });
		console.log(restaurant.users);
		if (restaurant.users.some((user) => user.userId !== actorId))
			throw new ApplicationError(ErrMessages.restaurant.RestaurantDoesNotBelongToUser, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantHasActiveOrders(restaurantId: number) {
		const activeOrder = await this.orderService.getActiveOrderByRestaurantId(restaurantId);
		if (activeOrder)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantHasActiveOrders, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantIsDeactivated(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (!restaurant.isActive)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsNotActive, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantIsActive(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.isActive)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsActive, StatusCodes.BAD_REQUEST);
	}

	private async validateRestaurantIsActivated(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (!restaurant.isActive)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsNotActivated, StatusCodes.BAD_REQUEST);
	}
	/* === Helper Methods === */

	@Transactional()
	async createRestaurant(payload: Partial<Restaurant>) {
		await this.validateRestaurantNameUniqueness(payload.name!);
		const restaurant = await this.restaurantRepo.createRestaurant(payload);
		return restaurant;
	}

	async getRestaurantCuisines(cuisines: number[]) {
		return await this.restaurantRepo.getCuisines(cuisines);
	}

	private async formatRegisterRestaurantResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			status: restaurant.status,
			submittedAt: restaurant.createdAt
		};
	}

	private async formatActivationRestaurantResponse(restaurant: Restaurant, action: 'activate' | 'deactivate') {
		let activationData = {};
		if (action === 'activate') {
			activationData = {
				activatedAt: restaurant.activationInfo?.activatedAt,
				activatedBy: restaurant.activationInfo?.activatedBy
			};
		} else {
			activationData = {
				deactivatedAt: restaurant.deactivationInfo?.deactivatedAt,
				deactivatedBy: restaurant.deactivationInfo?.deactivatedBy,
				reason: restaurant.deactivationInfo?.reason
			};
		}
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			isActive: restaurant.isActive,
			activationInfo: activationData
		};
	}

	private async formatViewRestaurantResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			avarageRating: Restaurant.calculateRestaurantAverageRating(restaurant.ratings),
			ratingCount: restaurant.ratings?.length || 0,
			status: restaurant.status,
			chain: this.formatChainInfo(restaurant.chain),
			cuisines: this.formatCuisines(restaurant.cuisines),
			contact: this.formatContactInfo(restaurant),
			location: restaurant.location,
			logoUrl: restaurant.logoUrl,
			bannerUrl: restaurant.bannerUrl,
			menus: this.formatMenus(restaurant.menus),
			deliveryFees: await SettingService.get(SettingKey.DELIVERY_BASE_FEE),
			minOrderAmount: await SettingService.get(SettingKey.MIN_ORDER_AMOUNT),
			minEstimatedDeliveryTime: await SettingService.get(SettingKey.MIN_ESTIMATED_DELIVERY_TIME),
			maxEstimatedDeliveryTime: await SettingService.get(SettingKey.MAX_ESTIMATED_DELIVERY_TIME)
		};
	}

	private formatChainInfo(chain: any) {
		return chain
			? {
					chainId: chain.chainId,
					name: chain.name
				}
			: null;
	}

	private formatCuisines(cuisines: any[]) {
		return (
			cuisines?.map((cuisine) => ({
				cuisineId: cuisine.cuisineId,
				name: cuisine.name
			})) || []
		);
	}

	private formatContactInfo(restaurant: Restaurant) {
		return {
			phone: restaurant.phone,
			email: restaurant.email
		};
	}

	private formatMenus(menus: any[]) {
		return (
			menus?.map((menu) => ({
				menuId: menu.menuId,
				menuTitle: menu.menuTitle,
				categories: this.formatMenuCategories(menu.menuCategories)
			})) || []
		);
	}

	private formatMenuCategories(menuCategories: any[]) {
		return menuCategories?.map((menuCategory) => this.formatMenuCategory(menuCategory.category)).filter(Boolean) || [];
	}

	private formatMenuCategory(category: any) {
		if (!category) return null;

		return {
			categoryId: category.categoryId,
			title: category.title,
			items: this.formatCategoryItems(category.items)
		};
	}

	private formatCategoryItems(items: any[]) {
		return (
			items?.map((item) => ({
				itemId: item.itemId,
				name: item.name,
				description: item.description,
				imagePath: item.imagePath,
				price: item.price,
				energyValCal: item.energyValCal,
				notes: item.notes
			})) || []
		);
	}

	private formatRestaurantStatusResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			status: restaurant.status
		};
	}
}
