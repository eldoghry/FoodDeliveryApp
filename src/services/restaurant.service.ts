import {
	Restaurant,
	RestaurantApprovalStatus,
	RestaurantDeactivatedBy,
	RestaurantRelations,
	RestaurantStatus,
	Chain,
	Item, Menu, User, UserTypeNames,
	Category,
	Cuisine
} from './../models';
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { ListRecommendedRestaurantsFilterDto, ListRestaurantsFilterDto, ListTopRatedRestaurantsFilterDto, RegisterRestaurantPayloadDto, SearchRestaurantsQueryDto } from '../dtos/restaurant.dto';
import { cursorPaginate, normalizeString } from '../utils/helper';
import { Transactional } from 'typeorm-transactional';
import { UserService } from './user.service';
import { SettingService } from './setting.service';
import { SettingKey } from '../enums/setting.enum';
import { OrderService } from './order.service';
import { RestaurantRepository, MenuRepository } from '../repositories';
import { ILike } from 'typeorm';

export class RestaurantService {
	private restaurantRepo = new RestaurantRepository();
	private menuRepo = new MenuRepository();
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

	async getAllRestaurants(filter: ListRestaurantsFilterDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getFilteredRestaurants(filter);
		return cursorPaginate(restaurants, limit, 'restaurantId');
	}

	async getTopRatedRestaurants(filter: ListTopRatedRestaurantsFilterDto) {
		const { limit } = filter;
		const restaurants = await this.restaurantRepo.getTopRatedRestaurants(filter);
		return cursorPaginate(restaurants, limit, 'restaurantId');
	}

	async getRecommendedRestaurants(filter: ListRecommendedRestaurantsFilterDto) {
		const restaurants = await this.restaurantRepo.getRecommendedRestaurants(filter);
		return restaurants
	}

	@Transactional()
	async createChain(payload: Partial<Chain>) {
		await this.ensureChainUniqueness(payload);
		const chain = await this.restaurantRepo.createChain(payload);
		return chain;
	}

	@Transactional()
	async createRestaurant(payload: Partial<Restaurant>) {
		await this.ensureRestaurantNameUniqueness(payload.name!);
		const restaurant = await this.restaurantRepo.createRestaurant(payload);
		return restaurant;
	}

	@Transactional()
	async registerRestaurant(payload: RegisterRestaurantPayloadDto) {
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

		await this.ensureOwnerContactUniqueness(userData);

		const chain = await this.createChain(chainData);
		restaurantData.chainId = chain.chainId;

		const cuisines = await this.restaurantRepo.getCuisines(payload.cuisines);
		restaurantData.cuisines = cuisines;

		const restaurant = await this.createRestaurant(restaurantData);
		return this.formatRestaurantRegistrationResponse(restaurant!);
	}

	async viewRestaurant(restaurantId: number) {
		const restaurant = await this.restaurantRepo.getDetailedActiveRestaurantView(restaurantId);
		return this.formatRestaurantDetailesResponse(restaurant!);
	}

	@Transactional()
	async deactivateRestaurant(
		userId: number,
		restaurantId: number,
		payload: Partial<Restaurant['deactivationInfo']>,
		deactivatedBy: RestaurantDeactivatedBy
	) {
		const deactivationInfo = { ...payload, deactivatedAt: new Date(), deactivatedBy };
		await this.ensureRestaurantCanBeDeactivated(userId, restaurantId);
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, {
			isActive: false,
			status: RestaurantStatus.closed,
			deactivationInfo
		});
		return this.formatRestaurantActivationResponse(restaurant!, 'deactivate');
	}

	@Transactional()
	async activateRestaurant(userId: number, restaurantId: number, activatedBy: RestaurantDeactivatedBy) {
		await this.ensureRestaurantCanBeActivated(userId, restaurantId);

		const activationInfo = { activatedAt: new Date(), activatedBy: activatedBy };
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, {
			isActive: true,
			status: RestaurantStatus.open,
			activationInfo
		});
		return this.formatRestaurantActivationResponse(restaurant!, 'activate');
	}

	@Transactional()
	async updateRestaurantStatus(userId: number, restaurantId: number, payload: { status: RestaurantStatus }) {
		await this.ensureRestaurantBelongsToUser(userId, restaurantId);
		await this.ensureRestaurantIsActive(restaurantId);

		if (payload.status === RestaurantStatus.closed || payload.status === RestaurantStatus.pause) {
			await this.ensureRestaurantHasNoActiveOrders(restaurantId);
		}
		const restaurant = await this.restaurantRepo.updateRestaurant(restaurantId, { status: payload.status });
		return this.formatRestaurantStatusResponse(restaurant!);
	}

	async searchRestaurants(query: SearchRestaurantsQueryDto) {
		const results = await this.restaurantRepo.searchRestaurants(query);
		return cursorPaginate(results, query.limit, ['rank', 'name']);
	}

	async searchItemsInMenu(restaurantId: number, query: { keyword: string }) {
		const results = await this.menuRepo.searchItemsInMenu(restaurantId, query);
		return results;
	}

	@Transactional()
	async updateRestaurantRating(restaurantId: number, rating: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		const totalRating = (restaurant!.totalRating + rating);
		const ratingCount = (restaurant!.ratingCount + 1);
		const averageRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0;
		await this.restaurantRepo.updateRestaurant(restaurantId, { totalRating, ratingCount, averageRating });
	}

	/* === Validation Methods === */

	private async ensureOwnerContactUniqueness(payload: Partial<User>) {
		await this.userService.ensureEmailUniqueness(payload.email!);
		await this.userService.ensurePhoneUniqueness(payload.phone!);
	}

	private async ensureChainUniqueness(payload: Partial<Chain>) {
		await this.ensureChainNameUniqueness(payload.name!);
		await this.ensureCommercialRegistrationNumberUniqueness(payload.commercialRegistrationNumber!);
		await this.ensureVatNumberUniqueness(payload.vatNumber!);
	}

	private async ensureChainNameUniqueness(name: string) {
		const chain = await this.restaurantRepo.getChainBy({ name: ILike(normalizeString(name)) as any });
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async ensureCommercialRegistrationNumberUniqueness(commercialRegistrationNumber: string) {
		const chain = await this.restaurantRepo.getChainBy({ commercialRegistrationNumber });
		if (chain)
			throw new ApplicationError(
				ErrMessages.restaurant.ChainCommercialRegistrationNumberAlreadyExists,
				StatusCodes.BAD_REQUEST
			);
	}

	private async ensureVatNumberUniqueness(vatNumber: string) {
		const chain = await this.restaurantRepo.getChainBy({ vatNumber });
		if (chain) throw new ApplicationError(ErrMessages.restaurant.ChainVatNumberAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantNameUniqueness(name: string) {
		const restaurant = await this.restaurantRepo.getRestaurantBy({ name: ILike(normalizeString(name)) as any });
		if (restaurant)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNameAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantCanBeDeactivated(userId: number, restaurantId: number) {
		await this.ensureRestaurantBelongsToUser(userId, restaurantId);
		await this.ensureRestaurantIsActive(restaurantId);
		await this.ensureRestaurantHasNoActiveOrders(restaurantId);
	}

	private async ensureRestaurantCanBeActivated(userId: number, restaurantId: number) {
		await this.ensureRestaurantBelongsToUser(userId, restaurantId);
		await this.ensureNotDeactivatedBySystemAdmin(restaurantId);
		await this.ensureRestaurantIsApproved(restaurantId);
		await this.ensureRestaurantIsNotActive(restaurantId);
	}

	private async ensureRestaurantIsApproved(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.approvalStatus !== RestaurantApprovalStatus.approved)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsNotApproved, StatusCodes.BAD_REQUEST);
	}

	private async ensureNotDeactivatedBySystemAdmin(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.deactivationInfo?.deactivatedBy === RestaurantDeactivatedBy.system)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantDectivatedBySystemAdmin, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantBelongsToUser(userId: number, restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId, relations: ['users.restaurants'] });
		if (restaurant.users.some((user) => user.userId !== userId))
			throw new ApplicationError(ErrMessages.restaurant.RestaurantDoesNotBelongToUser, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantHasNoActiveOrders(restaurantId: number) {
		const activeOrder = await this.orderService.getActiveOrderByRestaurantId(restaurantId);
		if (activeOrder)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantHasActiveOrders, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantIsActive(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (!restaurant.isActive)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsNotActive, StatusCodes.BAD_REQUEST);
	}

	private async ensureRestaurantIsNotActive(restaurantId: number) {
		const restaurant = await this.getRestaurantOrFail({ restaurantId });
		if (restaurant.isActive)
			throw new ApplicationError(ErrMessages.restaurant.RestaurantIsActive, StatusCodes.BAD_REQUEST);
	}

	/* === Helper Methods === */

	private async formatRestaurantRegistrationResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			status: restaurant.status,
			submittedAt: restaurant.createdAt
		};
	}

	private async formatRestaurantActivationResponse(restaurant: Restaurant, action: 'activate' | 'deactivate') {
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

	private async formatRestaurantDetailesResponse(restaurant: Restaurant) {
		return {
			restaurantId: restaurant.restaurantId,
			name: restaurant.name,
			averageRating: restaurant.averageRating,
			ratingCount: restaurant.ratingCount,
			status: restaurant.status,
			chain: this.formatChainInfo(restaurant.chain),
			cuisines: this.formatCuisines(restaurant.cuisines),
			contact: this.formatContactInfo(restaurant),
			location: restaurant.location,
			logoUrl: restaurant.logoUrl,
			bannerUrl: restaurant.bannerUrl,
			menu: this.formatMenu(restaurant.menu) || null,
			deliveryFees: await SettingService.get(SettingKey.DELIVERY_BASE_FEE),
			minOrderAmount: await SettingService.get(SettingKey.MIN_ORDER_AMOUNT),
			minEstimatedDeliveryTime: await SettingService.get(SettingKey.MIN_ESTIMATED_DELIVERY_TIME),
			maxEstimatedDeliveryTime: await SettingService.get(SettingKey.MAX_ESTIMATED_DELIVERY_TIME)
		};
	}

	private formatChainInfo(chain: Chain) {
		return chain
			? {
				chainId: chain.chainId,
				name: chain.name
			}
			: null;
	}

	private formatCuisines(cuisines: Cuisine[]) {
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

	private formatMenu(menu: Menu) {
		return {
			menuId: menu.menuId,
			categories: menu.categories?.map((category: Category) => this.formatMenuCategory(category))
		};
	}

	private formatMenuCategory(category: Category) {
		if (!category) return null;

		return {
			categoryId: category.categoryId,
			title: category.title,
			isActive: category.isActive,
			items: this.formatCategoryItems(category.items)
		};
	}

	private formatCategoryItems(items: Item[]) {
		return (
			items?.map((item) => ({
				itemId: item.itemId,
				name: item.name,
				description: item.description,
				imagePath: item.imagePath,
				price: item.price,
				energyValCal: item.energyValCal,
				notes: item.notes,
				isAvailable: item.isAvailable
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
