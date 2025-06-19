import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { RestaurantService } from '../services/restaurant.service';
import ApplicationError from '../errors/application.error';
import { ListRestaurantsDto } from '../dtos/restaurant.dto';

export class RestaurantController {
	private restaurantService = new RestaurantService();

	async createRestaurant(req: Request, res: Response) {
		// TODO: Implement createRestaurant logic
		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}

	async updateRestaurant(req: Request, res: Response) {
		// TODO: Implement updateRestaurant logic

		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
	}

	async getRestaurantById(req: Request, res: Response) {
		// TODO: Implement getRestaurantById logic
		throw new ApplicationError('Not implemented', StatusCodes.NOT_IMPLEMENTED);
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
