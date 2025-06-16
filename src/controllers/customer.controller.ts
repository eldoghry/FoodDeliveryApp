import { StatusCodes } from 'http-status-codes';
import { sendPaginatedResponse, sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import ApplicationError from '../errors/application.error';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
	private customerService = new CustomerService();

	async createCustomerAddress(req: Request, res: Response) {}

	async updateCustomerAddress(req: Request, res: Response) {}

	async deleteCustomerAddress(req: Request, res: Response) {}

	async getCustomerAddress(req: Request, res: Response) {}

	async rateOrder(req: Request, res: Response) {
		const { orderId } = req.params;
		const { rating, comment } = req.body;
		const user = req.user as AuthorizedUser;

		const createdRating = await this.customerService.rateOrder({
			orderId: Number(orderId),
			customerId: user.actorId,
			rating,
			comment
		});

		sendResponse(res, StatusCodes.CREATED, 'Rating created successfully', createdRating);
	}
}
