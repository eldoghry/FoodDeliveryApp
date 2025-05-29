import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import { OrderStatusChangeBy } from '../models/order/order-status_log.entity';

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

	async updateOrderStatus(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;
		const { status } = req?.validated?.body;
		const data = await this.orderService.updateOrderStatus(orderId, status, OrderStatusChangeBy.restaurant);
		sendResponse(res, StatusCodes.OK, 'Order status updated successfully', data);
	}
}
