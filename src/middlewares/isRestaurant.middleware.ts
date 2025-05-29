import ApplicationError from "../errors/application.error";
import ErrMessages from "../errors/error-messages";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RestaurantRepository } from "../repositories";

const restaurantRepo = new RestaurantRepository();

export const isRestaurant = async (req: Request, _res: Response, next: NextFunction) => {
	const { actorId } = req?.user || {};

	if (actorId) {
		const actor = await restaurantRepo.getRestaurantById(actorId);
		if (!actor) throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
	}

	next();
};