import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { RestaurantService } from '../services/restaurant.service';
import ApplicationError from '../errors/application.error';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';
import { RestaurantDeactivatedBy } from '../models';

export class RestaurantController {
	private restaurantService = new RestaurantService();

	async registerRestaurant (req: Request, res: Response) {
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
		// TODO: Implement listRestaurant logic
		// throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);

		const query = req.validated?.query as ListRestaurantsDto;

		const data = await this.restaurantService.getAllRestaurants(query);
		sendResponse(res, StatusCodes.OK, 'List Restaurants Successfully', data);
	}

	async searchRestaurant(req: Request, res: Response) {
		// TODO: Implement searchRestaurant logic
		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}

	async deactivateRestaurant(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const payload = req.validated?.body;
		const restaurant = await this.restaurantService.deactivateRestaurant(actorId, restaurantId, payload, RestaurantDeactivatedBy.restaurant);
		sendResponse(res, StatusCodes.OK, 'Restaurant deactivated successfully', restaurant);
	}

	async activateRestaurant(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const restaurant = await this.restaurantService.activateRestaurant(actorId, restaurantId, RestaurantDeactivatedBy.restaurant);
		sendResponse(res, StatusCodes.OK, 'Restaurant activated successfully', restaurant);
	}

	async updateRestaurantStatus(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const { restaurantId } = req.validated?.params;
		const payload = req.validated?.body;
		const restaurant = await this.restaurantService.updateRestaurantStatus(actorId, restaurantId, payload);
		sendResponse(res, StatusCodes.OK, 'Restaurant status updated successfully', restaurant);
	}

	async getTopRatedRestaurant(req: Request, res: Response) {
		// TODO: Implement getTopRatedRestaurant logic

		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}

	async getRecommendedRestaurant(req: Request, res: Response) {
		// TODO: Implement getRecommendedRestaurant logic

		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}
}
