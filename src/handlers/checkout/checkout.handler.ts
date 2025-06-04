import { CheckoutPayload } from '../../interfaces/order.interface';
import { Cart, Customer, Order, PaymentMethodEnum, Restaurant } from '../../models';
import { OrderRepository } from '../../repositories';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { PaymentService } from '../../services/payment/payment.service';
import { RestaurantService } from '../../services/restaurant.service';
import { calculateTotalPrice } from '../../utils/helper';

export interface CheckoutContext {
	payload: CheckoutPayload;
	customer?: Customer;
	restaurant?: Restaurant;
	cart?: Cart;
	totalAmount?: number;
	serviceFees?: number;
	deliveryFees?: number;
	order?: Order;
	processPaymentResult?: any;
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
