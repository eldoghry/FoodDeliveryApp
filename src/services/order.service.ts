import { Restaurant } from './../models/restaurant/restaurant.entity';
import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import { StatusCodes as HttpStatusCode } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';
import { PaymentService } from './payment/payment.service';
import { calculateTotalPrice } from '../utils/helper';
import { Customer, Order, OrderRelations, OrderStatusEnum, OrderStatusChangeBy } from '../models';
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

	async checkout(payload: {
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

		if (!order) throw new ApplicationError(ErrMessages.order.OrderNotFound, HttpStatusCode.NOT_FOUND);
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
			// order.status = OrderStatusEnum.failed;
			// await order.save();

			await this.updateOrderStatus(order.orderId, OrderStatusEnum.failed, OrderStatusChangeBy.payment);
			await order.reload();

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
		// order.status = OrderStatusEnum.pending;
		order.placedAt = new Date(); // set placedAt to current date
		await order.save();
		await this.updateOrderStatus(order.orderId, OrderStatusEnum.pending, OrderStatusChangeBy.payment);
		await order.reload();
		await this.cartService.clearCart(customer.customerId);
		await this.sendingPlaceOrderNotifications(order, customer, restaurant);
	}

	async processPaypalPaymentCallback(orderId: number, isPaymentSuccess: boolean) {
		const order = await this.getOrderOrFailBy({ orderId, relations: ['restaurant'] });

		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId: order.customerId,
			relations: ['user']
		});

		// todo: use update status & log method
		const orderStatus = isPaymentSuccess ? OrderStatusEnum.pending : OrderStatusEnum.failed;

		// order.status = orderStatus;
		// await order.save();

		await this.updateOrderStatus(order.orderId, orderStatus, OrderStatusChangeBy.payment);
		order.placedAt = new Date();
		await order.save();
		await order.reload();

		if (isPaymentSuccess) {
			await this.cartService.clearCart(customer.customerId);
			await this.sendingPlaceOrderNotifications(order, customer, order.restaurant);
			logger.info('Order payment confirmed', order.orderId);
		} else {
			logger.info('Order payment failed', order.orderId);
		}
	}

	private isWithin5Minutes(date: Date) {
		const now = new Date();
		const createdAt = new Date(date);
		const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
		return minutesSinceCreation <= 5;
	}


	private validateCancelTime(date: Date) {
		if (!this.isWithin5Minutes(date)) {
			throw new ApplicationError(ErrMessages.order.CannotCancelOrderAfter5Minutes, HttpStatusCode.BAD_REQUEST);
		}
		return true;
	}

	private async validateOrder(orderId: number) {
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, HttpStatusCode.NOT_FOUND);
		}
		return order;
	}

	// validate order status transition
	private async validateOrderStatus(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		const order = await this.validateOrder(orderId);

		const validStatuses = Object.values(OrderStatusEnum);
		if (!validStatuses.includes(newStatus)) {
			throw new ApplicationError(`Invalid status: ${newStatus}`, HttpStatusCode.BAD_REQUEST);
		}

		const currentStatus = order.status;

		// Define valid status transitions & valid actors for each status
		const orderStatusTransitionsByActors: Record<
			OrderStatusEnum,
			{ transitions: OrderStatusEnum[]; actors: OrderStatusChangeBy[] }
		> = {
			initiated: {
				transitions: [OrderStatusEnum.pending, OrderStatusEnum.failed],
				actors: [OrderStatusChangeBy.system]
			},
			pending: {
				transitions: [OrderStatusEnum.confirmed, OrderStatusEnum.canceled],
				actors: [OrderStatusChangeBy.payment, OrderStatusChangeBy.system]
			},
			confirmed: {
				transitions: [OrderStatusEnum.onTheWay, OrderStatusEnum.canceled, OrderStatusEnum.delivered],
				actors: [OrderStatusChangeBy.restaurant]
			},
			onTheWay: { transitions: [OrderStatusEnum.delivered], actors: [OrderStatusChangeBy.restaurant] },
			canceled: { transitions: [], actors: [OrderStatusChangeBy.system, OrderStatusChangeBy.restaurant] },
			delivered: { transitions: [], actors: [OrderStatusChangeBy.restaurant] },
			failed: { transitions: [], actors: [OrderStatusChangeBy.payment] }
		};

		// Check if the transition is valid & actor is allowed to perform this transition
		const allowedStatuses = orderStatusTransitionsByActors[currentStatus].transitions || [];
		const allowedActors = orderStatusTransitionsByActors[newStatus].actors || [];
		if (!allowedStatuses.includes(newStatus)) {
			throw new ApplicationError(
				`Invalid order status transition from ${currentStatus} to ${newStatus}`,
				HttpStatusCode.BAD_REQUEST
			);
		}
		// check if actor is allowed to perform this transition
		if (!allowedActors.includes(actor)) {
			throw new ApplicationError(
				`Invalid actor: ${actor} for order status transition from ${currentStatus} to ${newStatus}`,
				HttpStatusCode.BAD_REQUEST
			);
		}

		const pendingStatusLogDate = order.orderStatusLogs.find(log => log.status === OrderStatusEnum.pending)?.createdAt;

		// Specific checks for cancelation based on current status & actor
		if (
			allowedStatuses.includes(OrderStatusEnum.canceled) &&
			!(
				(currentStatus === OrderStatusEnum.pending &&
					actor === OrderStatusChangeBy.system && this.validateCancelTime(pendingStatusLogDate!)) ||
				(currentStatus === OrderStatusEnum.confirmed &&
					actor === OrderStatusChangeBy.restaurant)
			)
		) {
			throw new ApplicationError(
				`'${actor}' is not allowed to cancel an order in '${currentStatus}' status`,
				HttpStatusCode.BAD_REQUEST
			);
		}
	}

	private isValidActor(actor: any): actor is OrderStatusChangeBy {
		const validActors = Object.values(OrderStatusChangeBy);
		if (!validActors.includes(actor)) {
			throw new ApplicationError(`Invalid actor: ${actor}`, HttpStatusCode.BAD_REQUEST);
		}
		return true;
	}

	// update status log table
	async addOrderStatusLog(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		this.isValidActor(actor);
		await this.validateOrderStatus(orderId, newStatus, actor);

		await this.orderRepo.createOrderStatusLog({
			orderId,
			status: newStatus,
			changeBy: actor
		});
	}

	async updateOrderStatus(orderId: number, payload: any, actor: OrderStatusChangeBy) {
		await this.addOrderStatusLog(orderId, payload.status, actor);
		return await this.orderRepo.updateOrderStatus(orderId, payload);
	}


	async cancelOrder(orderId: number, actorType: string, payload: { reason: string }) {
		let actor: OrderStatusChangeBy;
		if (actorType === 'customer') {
			actor = OrderStatusChangeBy.system;
		} else if (actorType.includes('restaurant')) {
			actor = OrderStatusChangeBy.restaurant;
		} else {
			throw new ApplicationError(`${actorType} is not allowed to cancel an order`, HttpStatusCode.BAD_REQUEST);
		}

		const now = new Date();
		const formattedDate = now.toISOString().replace('T', ' ').replace('Z', '');
		return await this.updateOrderStatus(orderId, { status: OrderStatusEnum.canceled, cancellationInfo: { cancelledBy: actor, reason: payload.reason, cancelledAt: formattedDate } }, actor)
	}
}
