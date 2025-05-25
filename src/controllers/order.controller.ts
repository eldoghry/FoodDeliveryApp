import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { PaymentMethodEnum } from '../models';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {
		const payload = req?.validated?.body;
		const data = await this.orderService.placeOrder({
			customerId: req?.user?.actorId as number,
			addressId: payload?.addressId,
			paymentMethod: payload?.paymentMethod,
			restaurantId: payload?.restaurantId
			// cartId: payload?.cartId
		});
		sendResponse(res, StatusCodes.CREATED, 'Order created successfully', data);
	}
}
