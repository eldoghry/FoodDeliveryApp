import { calculateTotalPrice } from '../../utils/helper';
import { CheckoutContext, CheckoutHandler } from './checkout.handler';

export class CalculateAmountsHandler extends CheckoutHandler {
	constructor() {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		context.serviceFees = 10; // Replace with helper logic
		context.deliveryFees = 30; // Replace with helper logic
		context.totalAmount = calculateTotalPrice(context.cart!.cartItems, context.serviceFees, context.deliveryFees);

		return context;
	}
}
