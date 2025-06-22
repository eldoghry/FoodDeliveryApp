import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { RestaurantService } from '../services/restaurant.service';
import ApplicationError from '../errors/application.error';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';

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

	async toggleRestaurantStatus(req: Request, res: Response) {
		// TODO: Implement toggleRestaurantStatus logic
		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
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
