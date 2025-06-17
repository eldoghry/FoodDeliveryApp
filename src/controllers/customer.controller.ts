import { StatusCodes } from 'http-status-codes';
import { sendPaginatedResponse, sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
import ApplicationError from '../errors/application.error';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
	private customerService = new CustomerService();

	async createCustomerAddress(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const payload = req?.validated?.body;
		const addressResult = await this.customerService.createCustomerAddress({ customerId: actorId, ...payload });
		sendResponse(res, StatusCodes.CREATED, 'Address created successfully', addressResult);
	}

	async updateCustomerAddress(req: Request, res: Response) {}

	async deleteCustomerAddress(req: Request, res: Response) {}

	async getCustomerAddress(req: Request, res: Response) {}
}
