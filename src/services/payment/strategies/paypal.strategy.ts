import { config } from '../../../config/env';
import logger from '../../../config/logger';
import ApplicationError from '../../../errors/application.error';
import { generatePaymentReference } from '../../../utils/helper';
import { TransactionService } from '../../transaction.service';
import { IPaymentStrategy, PaymentRequestMetadata, PaymentResult } from '../paymentStrategy.interface';
import { Paypal } from '../paypal/paypal';
import {
	CreateOrderBodyRequest,
	PaypalCaptureResponse,
	PaypalCreateOrderResponse,
	PayPalWebhookEvent
} from '../paypal/paypal.interface';
import { Order } from './../../../models/order/order.entity';

export class PaypalStrategy implements IPaymentStrategy {
	private readonly paypalService = Paypal.getInstance();
	private readonly transactionService = new TransactionService();
	private readonly PROVIDER_NAME = 'PAYPAL';

	async processPayment(amount: number, data: PaymentRequestMetadata): Promise<PaymentResult> {
		logger.info(`Paypal payment registered: ${amount}`);

		const { items, order, transactionReference, transactionId } = data;

		const payload = this.createOrderBody(amount.toFixed(), transactionReference, order);

		let response: PaypalCreateOrderResponse | undefined = undefined;
		let errorMessage: string | undefined = undefined;
		let isApiSucess = false;

		try {
			response = await this.paypalService.createOrder(payload);
			logger.info(`📄 Paypal order created: ${response.id}`);
			isApiSucess = true;

			return {
				success: isApiSucess,
				paymentId: response.id,
				// redirectUrl: response.links.find((link: any) => link.rel === 'payer-action')?.href
				redirectUrl: response.links.find((link: any) => link.rel === 'approve')?.href
			};
		} catch (error: any) {
			logger.error('💥 Error creating Paypal order:', error);
			errorMessage = error?.message;

			return {
				success: isApiSucess,
				paymentId: '',
				error
			};
		} finally {
			await this.transactionService.createTransactionDetail({
				transactionId,
				provider: this.PROVIDER_NAME,
				action: 'create-order',
				requestPayload: payload,
				responsePayload: response,
				success: isApiSucess,
				errorMessage
			});
		}
	}

	async verifyPayment(paypalOrderId: string, data: any[]): Promise<PaypalCaptureResponse> {
		logger.info(`Paypal payment verification: ${paypalOrderId}`);
		const callbackEvent: PayPalWebhookEvent = data[0];
		if (!callbackEvent) throw new ApplicationError('Paypal Callback event is missing');

		const transactionReference = callbackEvent.resource.purchase_units[0].reference_id;
		const transaction = await this.transactionService.getOneTransactionOrFailBy({ transactionReference });

		let response: PaypalCaptureResponse | undefined = undefined;
		let errorMessage: string | undefined = undefined;
		let isApiSucess = false;

		try {
			response = await this.paypalService.capturePayment(paypalOrderId);
			isApiSucess = true;
			logger.info(`💵 Paypal order captured: ${response.id}[${response.status}}]`);
			return response;
		} catch (error: any) {
			logger.error('💥 Error Paypal payment verification:', error);
			errorMessage = error?.message;
			throw error;
		} finally {
			logger.info(`📝 log transaction detail [capture] success:${isApiSucess} | trxId: ${transaction.transactionId}`);
			await this.transactionService.createTransactionDetail({
				transactionId: transaction.transactionId,
				provider: this.PROVIDER_NAME,
				action: 'capture',
				requestPayload: { paypalOrderId },
				responsePayload: response,
				success: isApiSucess,
				errorMessage
			});
		}
	}

	private createOrderBody(amount: string, transactionReference: string, order: Order): CreateOrderBodyRequest {
		const payload: CreateOrderBodyRequest = {
			intent: 'CAPTURE',
			purchase_units: [
				{
					custom_id: order.orderId.toString(),
					reference_id: transactionReference,
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
