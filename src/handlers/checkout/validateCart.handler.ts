import { CartService } from '../../services/cart.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ValidateCartHandler extends CheckoutHandler {
	constructor(private cartService: CartService) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const { restaurantId, customerId } = context.payload;
		context.cart = await this.cartService.getAndValidateCart(customerId, restaurantId);
		return context;
	}
}
