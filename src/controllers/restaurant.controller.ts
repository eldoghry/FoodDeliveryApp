import { StatusCodes } from 'http-status-codes';
import { sendPaginatedResponse, sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { RestaurantService } from '../services/restaurant.service';
import ApplicationError from '../errors/application.error';
import { RestaurantDeactivatedBy } from '../models';

export class RestaurantController {
	private restaurantService = new RestaurantService();

	async registerRestaurant(req: Request, res: Response) {
		const payload = req.validated?.body;
		const restaurant = await this.restaurantService.registerRestaurant(payload);
		sendResponse(res, StatusCodes.CREATED, 'Registration successful. Your restaurant is pending approval.', restaurant);
	}

	async updateRestaurant(req: Request, res: Response) {
		// TODO: Implement updateRestaurant logic

		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}

	async viewRestaurant(req: Request, res: Response) {
		const { restaurantId } = req.validated?.params;
		const restaurant = await this.restaurantService.viewRestaurant(restaurantId);
		sendResponse(res, StatusCodes.OK, 'Restaurant view successfully', restaurant);
	}

	async listRestaurant(req: Request, res: Response) {
		const query = req.validated?.query;
		const data = await this.restaurantService.getAllRestaurants(query);
		sendPaginatedResponse(res, StatusCodes.OK, 'List Restaurants Successfully', data.data, {
			limit: query.limit,
			nextCursor: data.nextCursor,
			hasNextPage: data.hasNextPage
		});
	}

	async searchRestaurant(req: Request, res: Response) {
		const query = req.validated?.query;
		const data = await this.restaurantService.searchRestaurants(query);
		sendPaginatedResponse(res, StatusCodes.OK, 'Search Restaurants Successfully', data.data, {
			limit: query.limit,
			nextCursor: data.nextCursor,
			hasNextPage: data.hasNextPage
		});
	}

	async deactivateRestaurant(req: Request, res: Response) {
		const { actorId: userId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const payload = req.validated?.body;
		const restaurant = await this.restaurantService.deactivateRestaurant(
			userId,
			restaurantId,
			payload,
			RestaurantDeactivatedBy.restaurant
		);
		sendResponse(res, StatusCodes.OK, 'Restaurant deactivated successfully', restaurant);
	}

	async activateRestaurant(req: Request, res: Response) {
		const { actorId: userId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const restaurant = await this.restaurantService.activateRestaurant(
			userId,
			restaurantId,
			RestaurantDeactivatedBy.restaurant
		);
		sendResponse(res, StatusCodes.OK, 'Restaurant activated successfully', restaurant);
	}

	async updateRestaurantStatus(req: Request, res: Response) {
		const { actorId: userId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const payload = req.validated?.body;
		const restaurant = await this.restaurantService.updateRestaurantStatus(userId, restaurantId, payload);
		sendResponse(res, StatusCodes.OK, 'Restaurant status updated successfully', restaurant);
	}

	async getTopRatedRestaurants(req: Request, res: Response) {
		const query = req.validated?.query;
		const data = await this.restaurantService.getTopRatedRestaurants(query);
		sendPaginatedResponse(res, StatusCodes.OK, 'List Top Rated Restaurants Successfully', data.data, {
			limit: query.limit,
			nextCursor: data.nextCursor,
			hasNextPage: data.hasNextPage
		});
	}

	async getRecommendedRestaurants(req: Request, res: Response) {
		const query = req.validated?.query;
		const data = await this.restaurantService.getRecommendedRestaurants(query);
		sendResponse(res, StatusCodes.OK, 'List Recommended Restaurants Successfully', data);
	}

	async searchItemsInMenu(req: Request, res: Response) {
		const query = req.validated?.query;
		const { restaurantId } = req.validated?.params;
		const data = await this.restaurantService.searchItemsInMenu(restaurantId, query);
		sendResponse(res, StatusCodes.OK, 'Search Menu Items retrived Successfully', data);
	}
}
