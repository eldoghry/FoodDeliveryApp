import { Request, Response, NextFunction } from 'express';
import { RestaurantRepository } from '../repositories';
import ApplicationError from '../errors/application.error';
import { StatusCodes } from 'http-status-codes';
import ErrMessages from '../errors/error-messages';

const restaurantRepo = new RestaurantRepository();

export const isRestaurantAvailable = async (req: Request, _res: Response, next: NextFunction) => {
	const { restaurantId } = req.validated?.body;

	const restaurant = await restaurantRepo.getRestaurantById(restaurantId);

	if (!restaurant) throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, StatusCodes.NOT_FOUND);
	else if (restaurant.status !== 'open')
		throw new ApplicationError(ErrMessages.restaurant.RestaurantNotAvailable, StatusCodes.BAD_REQUEST);

	next();
};
