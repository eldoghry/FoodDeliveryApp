import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import { PaymentHandler } from '../services/payment/payment.handler';
import { PaymentMethodEnum } from '../models';
import ApplicationError from '../errors/application.error';
import { PaypalCaptureResponse, PayPalWebhookEvent } from '../services/payment/paypal/paypal.interface';
import logger from '../config/logger';
import { OrderService } from '../services/order.service';

export class PaymentController {
	async handlePaypalCallback(req: Request, res: Response) {
		const event: PayPalWebhookEvent = req.body;

		if (!event) throw new ApplicationError('Invalid paypal callback', StatusCodes.BAD_REQUEST);

		logger.info('Received PayPal event:', event.event_type);

		const paymentHandler = new PaymentHandler(PaymentMethodEnum.CARD);

		if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
			const paypalOrderId = event.resource.id;
			const result = (await paymentHandler.verifyPayment(paypalOrderId, event)) as PaypalCaptureResponse;

			// console.log(result);
			// console.dir(result.purchase_units[0].payments, { depth: null });
			if (result.status === 'COMPLETED') {
				const orderId = Number(event.resource.purchase_units[0].custom_id);
				const orderService = new OrderService();
				await orderService.processPaypalPaymentCallback(+orderId, paypalOrderId, true);
			}
		}

		// todo handle other status like canceled or failed

		sendResponse(res, HttpStatusCodes.OK, 'OK');
	}
}
