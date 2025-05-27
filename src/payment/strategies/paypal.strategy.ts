import logger from '../../config/logger';
import { generatePaymentReference } from '../../utils/helper';
import { IPaymentStrategy, PaymentResult } from '../paymentStrategy.interface';
import { Paypal } from '../paypal/paypal';

export class PaypalStrategy implements IPaymentStrategy {
	private readonly paypalService = new Paypal();

	async processPayment(amount: number, ...data: any): Promise<PaymentResult> {
		logger.info(`Paypal payment registered: ${amount}`);

		try {
			const order = await this.paypalService.createOrder(amount);
			logger.info(`Paypal order created: ${order.id}`);

			return {
				success: true,
				paymentId: order.id,
				redirectUrl: order.links.find((link: any) => link.rel === 'payer-action')?.href
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

	async verifyPayment(): Promise<any> {
		// TODO later
	}
}
