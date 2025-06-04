import { PaymentService } from '../../services/payment/payment.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ProcessPaymentHandler extends CheckoutHandler {
	constructor() {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const paymentService = new PaymentService(context.payload.paymentMethod);
		context.processPaymentResult = await paymentService.processPayment(context.totalAmount!, {
			items: context.cart!.cartItems,
			order: context.order
		});

		return context;
	}
}
