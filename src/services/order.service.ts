import { Restaurant } from './../models/restaurant/restaurant.entity';
import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';
import { PaymentService } from './payment/payment.service';
import { calculateTotalItems, calculateTotalPrice } from '../utils/helper';
import { CartItem, Customer, Order, OrderRelations, OrderStatusEnum } from '../models';
import { Notify } from '../shared/notify';
import EventEmitter from 'events';
import { RestaurantService } from './restaurant.service';
import { PlaceOrderResponse } from '../interfaces/order.interface';

export class OrderService {
	private orderRepo = new OrderRepository();
	private cartService = new CartService();
	private customerService = new CustomerService();
	private dataSource = AppDataSource; // to be used for typeorm transactions
	private restaurantService = new RestaurantService();

	async placeOrder(payload: {
		customerId: number;
		restaurantId: number;
		// cartId: number;
		addressId: number;
		paymentMethod: PaymentMethodEnum;
	}): Promise<PlaceOrderResponse> {
		const { customerId, addressId, restaurantId, paymentMethod } = payload;

		// * get restaurant
		const restaurant = await this.restaurantService.getRestaurantOrFail({ restaurantId });

		// * get customer with address from customer service
		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId,
			relations: ['user', 'addresses']
		});

		// * validate delivery address belong to user
		if (customer.addresses.find((address) => address.addressId === addressId) === undefined)
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCodes.NOT_FOUND);

		// * get cart with items
		const cart = await this.getAndValidateCart(customerId, restaurantId);

		// const totalItems = calculateTotalItems(cart.cartItems);
		// const totalCartItemsAmounts = 100; // todo: get from helper
		const serviceFees = 10; // todo: get from helper
		const deliveryFees = 30; // todo: get from helper
		const totalAmount = calculateTotalPrice(cart.cartItems, serviceFees, deliveryFees);

		// create order and order items
		const order = await this.orderRepo.createOrder({
			restaurantId,
			customerId,
			deliveryAddressId: addressId,
			deliveryFees,
			serviceFees,
			totalAmount
			// placedAt: new Date()
		});

		const paymentService = new PaymentService(paymentMethod);
		const paymentResult = await paymentService.processPayment(totalAmount, {
			items: cart.cartItems,
			order
		});

		if (!paymentResult.success) {
			// todo: use update status & log method
			order.status = OrderStatusEnum.failed;
			await order.save();
			return { success: false, error: paymentResult?.error, order };
		}

		// 3. Handle gateway redirects
		if (paymentResult?.redirectUrl) {
			return { success: true, paymentReference: paymentResult.paymentId, paymentUrl: paymentResult.redirectUrl, order };
		}

		if (paymentMethod === PaymentMethodEnum.COD) {
			// todo: use update status & log method
			order.status = OrderStatusEnum.pending;
			order.placedAt = new Date(); // set placedAt to current date
			await order.save();
			await this.cartService.clearCart(customer.user.userId);
			await this.sendingPlaceOrderNotification(order, customer, restaurant);
			return { success: true, paymentReference: paymentResult.paymentId, order };
		} else if (paymentMethod === PaymentMethodEnum.CARD) {
			// todo: use update status & log method
		}

		// order still waiting payment
		return { success: true, paymentReference: paymentResult.paymentId, paymentUrl: paymentResult.redirectUrl, order };
	}

	private async getAndValidateCart(customerId: number, restaurantId: number) {
		const cart = await this.cartService.getCartWithItems({ customerId, relations: ['cartItems'] });

		// * validate cart not empty and cart items belong to restaurant
		if (!cart.cartItems.length) throw new ApplicationError(ErrMessages.cart.CartIsEmpty, HttpStatusCodes.BAD_REQUEST);

		const itemsNotBelongToRestaurant = cart.cartItems.filter((item) => item.restaurantId !== restaurantId);

		if (itemsNotBelongToRestaurant.length)
			throw new ApplicationError(ErrMessages.cart.CartItemDoesNotBelongToTheSpecifiedCart, HttpStatusCodes.BAD_REQUEST);

		return cart;
	}

	private async sendingPlaceOrderNotification(order: Order, customer: Customer, restaurant: Restaurant) {
		await Notify.sendNotification('sms', {
			message: 'Your order has been placed successfully',
			phone: customer.user.phone
		});

		await Notify.sendNotification('email', {
			message: 'New order has been placed successfully',
			sender: 'system@fooddelivery.com',
			receivers: [restaurant.email],
			data: { order }
		});
	}

	async getOrderOrFailBy(filter: { orderId: number; relations?: OrderRelations[] }) {
		const order = await this.orderRepo.getOrderBy(filter);

		if (!order) throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		return order;
	}

	async placePaypalOrders(orderId: number, isPaymentSuccess: boolean) {
		const order = await this.getOrderOrFailBy({ orderId });
		if (isPaymentSuccess) {
			order.status = OrderStatusEnum.pending;
			await order.save();
			logger.info('Order payment confirmed', order.orderId);
		}
		// change order to pending(paypal success) | failed (paypal failed)
		// call order change status method (change order status + log status)
	}
}
