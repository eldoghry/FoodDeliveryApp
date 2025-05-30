import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import ApplicationError from '../errors/application.error';
import { OrderStatusChangeBy } from '../models/order/order-status_log.entity';

export class OrderController {
	private orderService = new OrderService();

	async checkout(req: Request, res: Response) {
		const payload = req?.validated?.body;
		const orderResult = await this.orderService.checkout({
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

	async updateOrderStatus(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;
		const { status } = req?.validated?.body;
		const data = await this.orderService.updateOrderStatus(orderId, {status}, OrderStatusChangeBy.restaurant);
		sendResponse(res, StatusCodes.OK, 'Order status updated successfully', data);
	}

	async cancelOrder(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;
		const actorType = req?.user?.actorType;
		const payload = req?.validated?.body;
		const data = await this.orderService.cancelOrder(orderId, actorType!, payload)
		sendResponse(res, StatusCodes.OK, 'Order cancelled successfully', data);
	}
}
