import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../utils/sendResponse';
import { Request, Response } from 'express';
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

	async getCustomerAddresses(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const addresses = await this.customerService.getCustomerAddresses(actorId);
		sendResponse(res, StatusCodes.OK, 'Addresses retrieved successfully', addresses);
	}

	async assignDefaultAddress(req: Request, res: Response) {
		const { actorId } = req?.user as AuthorizedUser;
		const { addressId } = req?.validated?.params;
		const address = await this.customerService.assignDefaultAddress(actorId, addressId);
		sendResponse(res, StatusCodes.OK, 'Address assigned successfully', address);
	}

	async updateCustomerAddress(req: Request, res: Response) {
		// TODO: Implement update customer address logic
	}

	async deleteCustomerAddress(req: Request, res: Response) {
		// TODO: Implement delete customer address logic
	}

	async getCustomerAddress(req: Request, res: Response) {
		// TODO: Implement get customer address logic
	}

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
