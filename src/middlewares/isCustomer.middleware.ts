import { Request, Response, NextFunction } from 'express';
import { CustomerRepository } from '../repositories';
import ApplicationError from '../errors/application.error';
import { StatusCodes } from 'http-status-codes';
import ErrMessages from '../errors/error-messages';

const customerRepo = new CustomerRepository();

export const isCustomer = async (req: Request, _res: Response, next: NextFunction) => {
	const { actorId, actorType } = req?.user || {};

	if (!actorId || !actorType || actorType !== 'customer')
		throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);

	if (actorId) {
		const actor = await customerRepo.getCustomerById({ customerId: actorId });
		if (!actor) throw new ApplicationError(ErrMessages.auth.forbidden, StatusCodes.FORBIDDEN);
	}
	next();
};
