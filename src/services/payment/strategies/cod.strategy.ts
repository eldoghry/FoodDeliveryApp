import logger from '../../../config/logger';
import { generatePaymentReference } from '../../../utils/helper';
import { IPaymentStrategy, PaymentResult } from '../paymentStrategy.interface';

export class CodStrategy implements IPaymentStrategy {
	async processPayment(amount: number): Promise<PaymentResult> {
		logger.info(`COD payment registered: ${amount}`);

		return Promise.resolve({
			success: true,
			paymentId: generatePaymentReference('COD')
		});
	}
}
