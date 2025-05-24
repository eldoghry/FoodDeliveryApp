import { StatusCodes } from 'http-status-codes';
import { OrderService } from '../services/order.service';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';

export class OrderController {
	private orderService = new OrderService();

	async placeOrder(req: Request, res: Response) {
		const data = await this.orderService.placeOrder();
		sendResponse(res, StatusCodes.CREATED, 'Order created successfully', data);
	}
}
