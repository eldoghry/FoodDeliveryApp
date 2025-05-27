import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { PaymentMethodEnum } from '../models';
import { PaymentFactory } from './payment.factory';
import { IPaymentStrategy } from './paymentStrategy.interface';

export class PaymentService {
	private strategy: IPaymentStrategy;

	constructor(paymentMethod: PaymentMethodEnum) {
		this.strategy = PaymentFactory.createStrategy(paymentMethod);
	}

	async processPayment(amount: number, metadata?: Record<string, any>) {
		return this.strategy.processPayment(amount, metadata);
	}

	async verifyPayment(paymentId: string) {
		if (!this.strategy.verifyPayment) {
			throw new ApplicationError('Verification payment not supported for this method', StatusCodes.NOT_IMPLEMENTED);
		}
		return this.strategy.verifyPayment(paymentId);
	}
}
