import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { PaymentMethodEnum } from '../models';
import ApplicationError from '../errors/application.error';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {
		const payload = req?.validated?.body;
		const orderResult = await this.orderService.placeOrder({
			customerId: req?.user?.actorId as number,
			addressId: payload?.addressId,
			paymentMethod: payload?.paymentMethod,
			restaurantId: payload?.restaurantId
			// cartId: payload?.cartId
		});

		if (!orderResult.success)
			throw new ApplicationError(`Placing Order failed`, StatusCodes.BAD_REQUEST, true, orderResult.error);
		else if (orderResult?.paymentUrl)
			sendResponse(res, StatusCodes.CREATED, 'Complete Payment to proceed', orderResult);
		else sendResponse(res, StatusCodes.CREATED, 'Order created successfully', orderResult);
	}
}
