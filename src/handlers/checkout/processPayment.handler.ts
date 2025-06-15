import { Transaction } from 'typeorm';
import { TransactionPaymentStatus } from '../../enums/transaction.enum';
import { PaymentHandler } from '../../services/payment/payment.handler';
import { TransactionService } from '../../services/transaction.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ProcessPaymentHandler extends CheckoutHandler {
	private transactionService = new TransactionService();

	constructor() {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		// 1) Create transaction record
		const transaction = await this.transactionService.createTransaction({
			amount: context.totalAmount!,
			status: TransactionPaymentStatus.INITIATED,
			orderId: context.order?.orderId,
			customerId: context?.customer?.customerId,
			paymentMethodCode: context.payload.paymentMethod
			// paymentReference: context.processPaymentResult.paymentId
		});

		context.transaction = transaction;
		const paymentHandler = new PaymentHandler(context.payload.paymentMethod);

		// 2) process payment
		context.processPaymentResult = await paymentHandler.processPayment(context.totalAmount!, {
			transactionId: transaction.transactionId,
			transactionReference: transaction.transactionReference,
			order: context.order!,
			items: context.cart!.cartItems
		});

		// 3) assign payment referenace to transaction
		const updatedTransaction = await this.transactionService.updateTransactionPaymentReference(
			transaction.transactionId,
			context.processPaymentResult.paymentId
		);

		context.transaction = updatedTransaction === null ? undefined : updatedTransaction;

		return context;
	}
}
