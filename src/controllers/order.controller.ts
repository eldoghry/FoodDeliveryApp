import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendPaginatedResponse, sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import ApplicationError from '../errors/application.error';
import { OrderStatusChangeBy } from '../models/order/order-status_log.entity';
import { AuthorizedUser } from '../middlewares/auth.middleware';

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
		const data = await this.orderService.updateOrderStatus(orderId, { status }, OrderStatusChangeBy.restaurant);
		sendResponse(res, StatusCodes.OK, 'Order status updated successfully', data);
	}

	async cancelOrder(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;
		const actorType = req?.user?.actorType;
		const payload = req?.validated?.body;
		const data = await this.orderService.cancelOrder(orderId, actorType!, payload);
		sendResponse(res, StatusCodes.OK, 'Order cancelled successfully', data);
	}

	async getOrderSummary(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;
		const data = await this.orderService.getOrderSummary(orderId);
		sendResponse(res, StatusCodes.OK, 'Order summary retrieved successfully', data);
	}

	async getOrdersHistory(req: Request, res: Response) {
		const { actorType, actorId } = req?.user as AuthorizedUser;
		const { page, perPage ,cursor} = req?.validated?.query;
		const data = await this.orderService.getOrdersHistory(actorType as 'customer' | 'restaurant', actorId, perPage, cursor);
		sendPaginatedResponse(res, StatusCodes.OK, 'Orders retrieved successfully', data.orders, perPage, {nextCursor: data.nextCursor, hasNextPage: data.hasNextPage});
	}

	async getOrderDetails(req: Request, res: Response) {
		const orderId = req?.validated?.params?.orderId;

		const data = await this.orderService.getOrderDetails(orderId, req?.user?.actorId as number);

		console.log(data);
		if (!data) throw new ApplicationError(`Order not found`, StatusCodes.NOT_FOUND, true, 'Order not found');

		sendResponse(res, StatusCodes.OK, 'Order details retrieved successfully', data);
	}
}
