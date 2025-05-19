import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { Address, Cart, Order, OrderItem } from '../models';
import { CartRepository, OrderRepository } from '../repositories';

// worked for 4.5 hours
export class OrderService {
	private orderRepo = new OrderRepository();
	private cartRepo = new CartRepository();

	async createOrderFromCart(cart: Cart, address: Address, data: any): Promise<Order> {
		const pendingStatus = await this.orderRepo.getOrderStatusByName('PENDING');

		if (!pendingStatus) {
			throw new ApplicationError('System Error: Order status not found', StatusCodes.INTERNAL_SERVER_ERROR);
		}

		// Create Order
		const order = new Order();
		order.orderStatusId = pendingStatus.orderStatusId;
		order.cartId = cart.cartId;
		order.customerId = cart.customerId;
		order.deliveryAddressId = address.addressId;
		order.customerInstructions = data.customerInstructions || '';
		order.totalItems = cart.totalItems;

		// Calculate totals
		order.totalItemsAmount = await this.calculateItemsTotal(cart);
		order.deliveryFees = this.calculateDeliveryFees(cart);
		order.serviceFees = this.calculateServiceFees(cart, order.totalItemsAmount);
		order.discount = this.calculateDiscount(cart);
		order.totalAmount = order.totalItemsAmount + order.deliveryFees + order.serviceFees - order.discount;

		order.placedAt = new Date();

		return await this.orderRepo.createOrder(order);
	}

	async createOrderItems(order: Order, cart: Cart): Promise<OrderItem[]> {
		const orderItems: OrderItem[] = [];

		for (const cartItem of cart.items) {
			const orderItem = new OrderItem();
			orderItem.orderId = order.orderId;
			orderItem.menuItemId = cartItem.menuItemId;
			orderItem.quantity = cartItem.quantity;
			orderItem.itemPrice = cartItem.price;
			orderItem.totalPrice = cartItem.totalPrice;

			orderItems.push(await this.orderRepo.addOrderItem(orderItem));
		}

		return orderItems;
	}

	async updateOrderStatus(orderId: number, statusName: string): Promise<void> {
		const orderStatus = await this.orderRepo.getOrderStatusByName(statusName);

		if (!orderStatus) {
			throw new ApplicationError('Order status not Found', StatusCodes.BAD_REQUEST);
		}

		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError('Order status not Found', StatusCodes.NOT_FOUND);
		}
		order.orderStatusId = orderStatus.orderStatusId;

		if (statusName === 'DELIVERED') {
			order.deliveredAt = new Date();
		}

		await this.orderRepo.updateOrder(orderId, order);
	}

	async getOrderDetails(orderId: number): Promise<any | null> {
		const order = await this.orderRepo.findOrderDetailsById(orderId);

		if (!order) return null;

		return order;
	}

	private async calculateItemsTotal(cart: Cart): Promise<number> {
		return this.cartRepo.calculateCartTotal(cart.cartId);
	}

	private calculateDeliveryFees(cart: Cart): number {
		// Logic to calculate delivery fees
		// This could be based on distance, restaurant policy, etc.
		return 5.0; // Example fixed fee
	}

	private calculateServiceFees(cart: Cart, subtotal: number): number {
		// Logic to calculate service fees (platform fee)
		// Could be a percentage of the subtotal
		return subtotal * 0.05; // Example: 5% of subtotal
	}

	private calculateDiscount(cart: Cart): number {
		// Logic for applying any discounts
		// This could include promo codes, loyalty discounts, etc.
		return 0; // No discount by default
	}
}
