import { config } from '../../../config/env';
import logger from '../../../config/logger';
import { generatePaymentReference } from '../../../utils/helper';
import { IPaymentStrategy, PaymentResult } from '../paymentStrategy.interface';
import { Paypal } from '../paypal/paypal';
import { CreateOrderBodyRequest, PaypalCaptureResponse } from '../paypal/paypal.interface';
import { Order } from './../../../models/order/order.entity';

export class PaypalStrategy implements IPaymentStrategy {
	private readonly paypalService = new Paypal();

	async processPayment(amount: number, data: any): Promise<PaymentResult> {
		logger.info(`Paypal payment registered: ${amount}`);

		const { items, order } = data;

		const payload = this.createOrderBody(amount.toFixed(), order);

		try {
			const order = await this.paypalService.createOrder(payload);
			logger.info(`Paypal order created: ${order.id}`);

			return {
				success: true,
				paymentId: order.id,
				// redirectUrl: order.links.find((link: any) => link.rel === 'payer-action')?.href
				redirectUrl: order.links.find((link: any) => link.rel === 'approve')?.href
			};
		} catch (error) {
			logger.error('Error creating Paypal order:', error);
			return {
				success: false,
				paymentId: '',
				error
			};
		}
	}

	async verifyPayment(paypalOrderId: string): Promise<PaypalCaptureResponse> {
		logger.info(`Paypal payment verification: ${paypalOrderId}`);
		try {
			const verifyResult = await this.paypalService.capturePayment(paypalOrderId);
			logger.info(`Paypal order created: ${JSON.stringify(verifyResult)}`);
			return verifyResult;
		} catch (error) {
			logger.error('Error Paypal payment verification:', error);
			throw error;
		}
	}

	private createOrderBody(amount: string, order: Order): CreateOrderBodyRequest {
		const payload: CreateOrderBodyRequest = {
			intent: 'CAPTURE',
			purchase_units: [
				{
					// invoice_id: order.orderId,
					reference_id: `${order.orderId}`,
					amount: {
						currency_code: 'USD',
						value: amount
					}
				}
			],
			application_context: {
				return_url: config.payment.paypal.redirectUrl,
				cancel_url: config.payment.paypal.cancelUrl
			}
		};
		return payload;
	}
}
