import { OrderRepository } from '../../repositories';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class CreateOrderHandler extends CheckoutHandler {
	constructor(private orderRepo: OrderRepository) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		context.order = await this.orderRepo.createOrder({
			restaurantId: context.payload.restaurantId,
			customerId: context.payload.customerId,
			deliveryAddressId: context.payload.addressId,
			deliveryFees: context.deliveryFees,
			serviceFees: context.serviceFees,
			totalAmount: context.totalAmount
			// placedAt: new Date()
		});

		return context;
	}
}
