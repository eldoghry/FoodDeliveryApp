import { Request, Response, NextFunction } from 'express';
import { RestaurantRepository } from '../repositories';
import ApplicationError from '../errors/application.error';
import { StatusCodes } from 'http-status-codes';
import ErrMessages from '../errors/error-messages';

const restaurantRepo = new RestaurantRepository();

export const isCustomer = async (req: Request, _res: Response, next: NextFunction) => {
	const { actorType } = req?.user || {};

	if (!actorType || actorType !== 'customer')
		throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);

	next();
};
