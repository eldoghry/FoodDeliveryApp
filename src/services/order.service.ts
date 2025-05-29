import { Restaurant } from './../models/restaurant/restaurant.entity';
import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';
import { PaymentService } from './payment/payment.service';
import { calculateTotalPrice } from '../utils/helper';
import { Customer, Order, OrderRelations, OrderStatusEnum } from '../models';
import { Notify } from '../shared/notify';
import { RestaurantService } from './restaurant.service';
import { PlaceOrderResponse } from '../interfaces/order.interface';
import { PaymentResult } from './payment/paymentStrategy.interface';

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
		this.customerService.validateCustomerAddress(customer, addressId);

		// * get cart with items
		const cart = await this.cartService.getAndValidateCart(customerId, restaurantId);

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
		const processPaymentResult = await paymentService.processPayment(totalAmount, {
			items: cart.cartItems,
			order
		});

		return this.handlePaymentResult({ processPaymentResult, order, customer, restaurant, paymentMethod });
	}

	private async sendingPlaceOrderNotifications(order: Order, customer: Customer, restaurant: Restaurant) {
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

	private async handlePaymentResult(params: {
		processPaymentResult: PaymentResult;
		order: Order;
		paymentMethod: PaymentMethodEnum;
		customer: Customer;
		restaurant: Restaurant;
	}): Promise<PlaceOrderResponse> {
		const { processPaymentResult, order, paymentMethod, customer, restaurant } = params;

		if (!processPaymentResult.success) {
			// todo: use update status & log method
			order.status = OrderStatusEnum.failed;
			await order.save();
			return { success: false, error: processPaymentResult?.error, order };
		}

		// 3. Handle gateway redirects
		if (processPaymentResult?.redirectUrl) {
			return {
				success: true,
				paymentReference: processPaymentResult.paymentId,
				paymentUrl: processPaymentResult.redirectUrl,
				order
			};
		}

		if (paymentMethod === PaymentMethodEnum.COD) {
			// todo: use update status & log method
			await this.finalizeOrderCOD(order, customer, restaurant);
			return { success: true, paymentReference: processPaymentResult.paymentId, order };
		}

		// Fallback for card (pending state assumed)
		return {
			success: true,
			paymentReference: processPaymentResult.paymentId,
			paymentUrl: processPaymentResult.redirectUrl,
			order
		};
	}

	async finalizeOrderCOD(order: Order, customer: Customer, restaurant: Restaurant) {
		// todo: use update status & log method
		order.status = OrderStatusEnum.pending;
		order.placedAt = new Date(); // set placedAt to current date
		await order.save();
		await this.cartService.clearCart(customer.user.userId); // todo: change it to work user customer id instead of user id
		await this.sendingPlaceOrderNotifications(order, customer, restaurant);
	}

	async processPaypalPaymentCallback(orderId: number, isPaymentSuccess: boolean) {
		const order = await this.getOrderOrFailBy({ orderId });

		// todo: use update status & log method
		const orderStatus = isPaymentSuccess ? OrderStatusEnum.pending : OrderStatusEnum.failed;

		order.status = orderStatus;

		await order.save();

		isPaymentSuccess && logger.info('Order payment confirmed', order.orderId);
		!isPaymentSuccess && logger.info('Order payment failed', order.orderId);
	}
}
