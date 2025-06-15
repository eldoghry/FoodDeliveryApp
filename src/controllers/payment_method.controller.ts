import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { PaymentMethodService } from '../services/payment_method.service';

export class PaymentMethodController {
	private paymentMethodService = new PaymentMethodService();

	async getAll(req: Request, res: Response) {
		const paymentMethods = await this.paymentMethodService.getAll();
		sendResponse(res, HttpStatusCodes.OK, 'All Active payment method.', paymentMethods);
	}
}
