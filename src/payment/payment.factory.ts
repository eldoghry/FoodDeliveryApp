import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { PaymentMethodEnum } from '../models';
import { IPaymentStrategy } from './paymentStrategy.interface';
import { CodStrategy } from './strategies/cod.strategy';
import { PaypalStrategy } from './strategies/paypal.strategy';

export class PaymentFactory {
	static createStrategy(paymentMethod: PaymentMethodEnum): IPaymentStrategy {
		switch (paymentMethod) {
			case PaymentMethodEnum.COD:
				return new CodStrategy();

			case PaymentMethodEnum.CARD:
				return new PaypalStrategy();

			default:
				throw new ApplicationError(`Unsupported payment method: ${paymentMethod}`, StatusCodes.BAD_REQUEST);
		}
	}
}
