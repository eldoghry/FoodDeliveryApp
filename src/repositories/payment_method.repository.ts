import { AppDataSource } from '../config/data-source';
import { PaymentMethod } from '../models/payment_method/payment-method.entity';
import { Repository } from 'typeorm';
import { PaymentMethodStatus } from '../enums/payment_method.enum';

export class PaymentMethodRepository {
	private paymentMethodRepo: Repository<PaymentMethod>;

	constructor() {
		this.paymentMethodRepo = AppDataSource.getRepository(PaymentMethod);
	}

	// Payment Method operations
	async getAllPaymentMethods(): Promise<PaymentMethod[]> {
		return await this.paymentMethodRepo.find({
			where: { status: PaymentMethodStatus.ACTIVE },
			order: { order: 'ASC' }
		});
	}

	async getPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod | null> {
		return await this.paymentMethodRepo.findOne({
			where: { paymentMethodId }
		});
	}
}
