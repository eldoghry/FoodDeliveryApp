import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';
import { OrderStatusChangeBy, OrderStatusEnum } from '../models';

export class OrderService {
	private orderRepo = new OrderRepository();
	private cartService = new CartService();
	private customerService = new CustomerService();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async placeOrder(payload: {
		customerId: number;
		restaurantId: number;
		// cartId: number;
		addressId: number;
		paymentMethod: PaymentMethodEnum;
	}) {
		// get restaurant from restaurant service
		// get customer with address from customer service
		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId: payload.customerId,
			relations: ['user', 'addresses']
		});

		if (customer.addresses.find((address) => address.addressId === payload.addressId) === undefined)
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCodes.NOT_FOUND);

		// get customer address from customer service
		// get cart with items from cart service
		const cart = await this.cartService.getCartWithItems({ customerId: payload.customerId, relations: ['cartItems'] });

		return { cart, customer };

		// get service fees from app setting service
		// validate payment method
		// create order
		// do payment
		// prepare response and return
	}


	private isWithin5Minutes(date: Date) {
		const now = new Date();
		const createdAt = new Date(date);
		const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
		return minutesSinceCreation <= 5;
	}

	// validate order status transition
	private async validateOrderStatus(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		const order = await this.orderRepo.getOrderById(orderId);
		if (!order) {
			throw new ApplicationError(ErrMessages.order.OrderNotFound, HttpStatusCodes.NOT_FOUND);
		}

		const currentStatus = order.status;

		// Define valid status transitions & valid actors for each status
		const orderStatusTransitionsByActors: Record<OrderStatusEnum, { transitions: OrderStatusEnum[], actors: OrderStatusChangeBy[] }> = {
			initiated: { transitions: [OrderStatusEnum.pending, OrderStatusEnum.failed], actors: [OrderStatusChangeBy.system] },
			pending: { transitions: [OrderStatusEnum.confirmed, OrderStatusEnum.canceled], actors: [OrderStatusChangeBy.payment, OrderStatusChangeBy.system] },
			confirmed: { transitions: [OrderStatusEnum.onTheWay, OrderStatusEnum.canceled, OrderStatusEnum.delivered], actors: [OrderStatusChangeBy.restaurant] },
			onTheWay: { transitions: [OrderStatusEnum.delivered], actors: [OrderStatusChangeBy.restaurant] },
			canceled: { transitions: [], actors: [OrderStatusChangeBy.system, OrderStatusChangeBy.restaurant] },
			delivered: { transitions: [], actors: [OrderStatusChangeBy.restaurant] },
			failed: { transitions: [], actors: [OrderStatusChangeBy.payment] }
		};


		// Check if the transition is valid & actor is allowed to perform this transition
		const allowedStatuses = orderStatusTransitionsByActors[currentStatus].transitions || [];
		const allowedActors = orderStatusTransitionsByActors[newStatus].actors || [];
		if (!allowedStatuses.includes(newStatus)) {
			throw new ApplicationError(`Invalid order status transition from ${currentStatus} to ${newStatus}`, HttpStatusCodes.BAD_REQUEST);
		}
		// check if actor is allowed to perform this transition
		if (!allowedActors.includes(actor)) {
			throw new ApplicationError(`Invalid actor: ${actor} for order status transition from ${currentStatus} to ${newStatus}`, HttpStatusCodes.BAD_REQUEST);
		}

		// Specific checks for cancelation based on current status & actor
		if (allowedStatuses.includes(OrderStatusEnum.canceled) &&
			!(
				(currentStatus === OrderStatusEnum.pending &&
					actor === OrderStatusChangeBy.system) ||
				(currentStatus === OrderStatusEnum.confirmed &&
					actor === OrderStatusChangeBy.restaurant)
			)
		) {
			throw new ApplicationError(
				`'${actor}' is not allowed to cancel an order in '${currentStatus}' status`,
				HttpStatusCodes.BAD_REQUEST
			);
		}
	}

	// update status field in order table
	async changeOrderStatus(orderId: number, newStatus: OrderStatusEnum) {
		return await this.orderRepo.updateOrder(orderId, { status: newStatus });
	}

	private isValidActor(actor: any): actor is OrderStatusChangeBy {
		const validActors = Object.values(OrderStatusChangeBy);
		if (!validActors.includes(actor)) {
			throw new ApplicationError(`Invalid actor: ${actor}`, HttpStatusCodes.BAD_REQUEST);
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
		})
	}


	async updateOrderStatus(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		await this.addOrderStatusLog(orderId, newStatus, actor);
		return await this.changeOrderStatus(orderId, newStatus);
	}
}

