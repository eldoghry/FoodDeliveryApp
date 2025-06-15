import { PaymentMethod } from '../models';
import { PaymentMethodRepository } from '../repositories';

export class PaymentMethodService {
	private paymentMethodRepo = new PaymentMethodRepository();

	getAll(): Promise<PaymentMethod[]> {
		return this.paymentMethodRepo.getAllPaymentMethods();
	}
}
