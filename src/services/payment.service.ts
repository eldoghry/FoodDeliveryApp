import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { Order, PaymentMethod, Transaction, TransactionDetail } from '../models';
import { PaymentRepository } from '../repositories';

export class PaymentService {
	private paymentMethodRepo = new PaymentRepository();

	async validatePaymentMethod(paymentMethodId: number): Promise<PaymentMethod> {
		const paymentMethod = await this.paymentMethodRepo.getPaymentMethodById(paymentMethodId);

		if (!paymentMethod) {
			throw new ApplicationError('Payment Method not found', StatusCodes.NOT_FOUND);
		}

		if (!paymentMethod.isActive) {
			throw new ApplicationError('Payment method is not active', StatusCodes.BAD_REQUEST);
		}
		return paymentMethod;
	}

	async processPayment(
		order: Order,
		paymentMethodId: number
	): Promise<{ success: boolean; transactionId?: number; message: string }> {
		const paymentMethod = await this.validatePaymentMethod(paymentMethodId);

		// In the real implementation, this would communicate with a payment gateway
		// For now, we'll simulate payment processing

		// For this example implementation, we'll assume payment is successful
		const isSuccessful = true;

		const statusName = isSuccessful ? 'COMPLETED' : 'FAILED';
		const paymentStatus = await this.paymentMethodRepo.getPaymentStatusByName(statusName);

		if (!paymentStatus) {
			throw new ApplicationError('Payment Status Not Found', StatusCodes.INTERNAL_SERVER_ERROR);
		}

		const transaction = new Transaction();
		transaction.customerId = order.customerId;
		transaction.paymentMethodId = paymentMethodId;
		transaction.orderId = order.orderId;
		transaction.amount = order.totalAmount;
		transaction.paymentStatusId = paymentStatus.paymentStatusId;
		transaction.transactionCode = this.generateTransactionCode();

		const savedTransaction = await this.paymentMethodRepo.createTransaction(transaction);

		const transactionDetail = new TransactionDetail();
		transactionDetail.transactionId = savedTransaction.transactionId;
		transactionDetail.detailKey = { key: 'processor_response' };
		transactionDetail.detailValue = {
			success: isSuccessful,
			message: isSuccessful ? 'Payment processed successfully' : 'Payment processing failed',
			timestamp: new Date().toISOString()
		};

		await this.paymentMethodRepo.addTransactionDetail(transactionDetail);

		if (isSuccessful) {
			return {
				success: true,
				transactionId: savedTransaction.transactionId,
				message: 'Payment processed successfully'
			};
		} else {
			return {
				success: false,
				transactionId: savedTransaction.transactionId,
				message: 'Payment processing failed'
			};
		}
	}

	private generateTransactionCode(): string {
		// Generate a unique transaction code
		// This could be a UUID or a custom format
		return `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0')}`;
	}
}
