import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../../errors/application.error';
import { PaymentMethodEnum } from '../../models';
import { PaymentFactory } from './payment.factory';
import { IPaymentStrategy, PaymentRequestMetadata } from './paymentStrategy.interface';

export class PaymentHandler {
	private strategy: IPaymentStrategy;

	constructor(paymentMethod: PaymentMethodEnum) {
		this.strategy = PaymentFactory.createStrategy(paymentMethod);
	}

	async processPayment(amount: number, metadata?: PaymentRequestMetadata) {
		return this.strategy.processPayment(amount, metadata);
	}

	async verifyPayment(paymentId: string, ...data: any) {
		if (!this.strategy.verifyPayment) {
			throw new ApplicationError('Verification payment not supported for this method', StatusCodes.NOT_IMPLEMENTED);
		}
		return this.strategy.verifyPayment(paymentId, data);
	}
}
