import { Request, Response, NextFunction } from 'express';
import { CustomerRepository, RestaurantRepository } from '../repositories';
import ApplicationError from '../errors/application.error';
import { StatusCodes } from 'http-status-codes';
import ErrMessages from '../errors/error-messages';

const customerRepo = new CustomerRepository();
const restaurantRepo = new RestaurantRepository();

type actorType = 'customer' | 'restaurant_user';
interface actorTypeOptions {
    allowedActorTypes: actorType[];
}

export const verifyActor =
    ({ allowedActorTypes }: actorTypeOptions) =>
        async (req: Request, _res: Response, next: NextFunction) => {
            const { actorId, actorType } = req?.user || {};

            if (!actorId || !actorType || !allowedActorTypes.includes(actorType as actorType)) {
                throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
            }

            let actor = null;

            if (actorType.includes('customer')) {
                actor = await customerRepo.getCustomerById({ customerId: actorId });
            } else if (actorType.includes('restaurant')) {
                actor = await restaurantRepo.getRestaurantById(actorId);
            }

            if (!actor) {
                throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
            }

            next();
        };
