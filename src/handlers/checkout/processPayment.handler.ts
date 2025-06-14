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
		const paymentHandler = new PaymentHandler(context.payload.paymentMethod);
		context.processPaymentResult = await paymentHandler.processPayment(context.totalAmount!, {
			items: context.cart!.cartItems,
			order: context.order
		});

		// Create transaction record
		const transaction = await this.transactionService.createTransaction({
			amount: context.totalAmount!,
			status: TransactionPaymentStatus.INITIATED,
			orderId: context.order?.orderId,
			customerId: context?.customer?.customerId,
			paymentMethodCode: context.payload.paymentMethod,
			paymentReference: context.processPaymentResult.paymentId
		});

		context.transaction = transaction;

		return context;
	}
}
