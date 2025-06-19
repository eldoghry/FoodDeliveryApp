import { CheckoutPayload } from '../../interfaces/order.interface';
import { Address, Cart, Customer, Order, Restaurant, Transaction } from '../../models';

export interface CheckoutContext {
	payload: CheckoutPayload;
	customer?: Customer;
	restaurant?: Restaurant;
	address?: Address;
	cart?: Cart;
	totalAmount?: number;
	serviceFees?: number;
	deliveryFees?: number;
	order?: Order;
	processPaymentResult?: any;
	transaction?: Transaction;
}

export abstract class CheckoutHandler {
	private next: CheckoutHandler | null = null;

	setNext(handler: CheckoutHandler) {
		this.next = handler;
		return handler;
	}

	async handle(context: CheckoutContext): Promise<CheckoutContext> {
		const updatedContext = await this.handleRequest(context);
		if (this.next) return this.next.handle(updatedContext);
		return updatedContext;
	}

	abstract handleRequest(context: CheckoutContext): Promise<CheckoutContext>;
}
