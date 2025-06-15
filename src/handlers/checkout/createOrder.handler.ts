import { HttpStatusCode } from 'axios';
import ApplicationError from '../../errors/application.error';
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

		const items = context.cart!.cartItems;
		if (!items.length) throw new ApplicationError('no items on cart', HttpStatusCode.BadRequest);
		await Promise.all(
			items.map((item) =>
				this.orderRepo.addOrderItem({
					orderId: context.order!.orderId,
					itemId: item.itemId,
					quantity: item.quantity,
					price: item.price,
					totalPrice: item.totalPrice
				})
			)
		);

		return context;
	}
}
