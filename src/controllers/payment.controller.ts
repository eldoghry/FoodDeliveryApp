import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import { PaymentService } from '../services/payment/payment.service';
import { PaymentMethodEnum } from '../models';
import ApplicationError from '../errors/application.error';
import { PaypalCaptureResponse, PayPalWebhookEvent } from '../services/payment/paypal/paypal.interface';
import logger from '../config/logger';
import { OrderService } from '../services/order.service';

export class PaymentController {
	async handlePaypalCallback(req: Request, res: Response) {
		const event: PayPalWebhookEvent = req.body;
		// console.log('paypal event', event);

		if (!event) throw new ApplicationError('Invalid paypal callback', StatusCodes.BAD_REQUEST);

		logger.info('Received PayPal event:', event.event_type);

		const paymentService = new PaymentService(PaymentMethodEnum.CARD);

		if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
			const paypalOrderId = event.resource.id;
			const result = (await paymentService.verifyPayment(paypalOrderId)) as PaypalCaptureResponse;

			// console.log(result);
			// console.dir(result.purchase_units[0].payments, { depth: null });
			if (result.status === 'COMPLETED') {
				const orderId = result.purchase_units[0].reference_id;
				const orderService = new OrderService();
				await orderService.processPaypalPaymentCallback(+orderId, true);
			}
		}

		// todo handle other status like canceled or failed

		sendResponse(res, HttpStatusCodes.OK, '');
	}
}
