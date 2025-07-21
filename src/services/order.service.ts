import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { CustomerService } from './customer.service';
import { isWithinTimeLimit as isWithinCancelTimeLimit } from '../utils/helper';
import {
	Customer,
	Order,
	OrderRelations,
	OrderStatusEnum,
	OrderStatusChangeBy,
	Cart,
	PaymentMethodEnum,
	Restaurant,
	Transaction,
	OrderItem
} from '../models';
import { Notify } from '../shared/notify';
import { RestaurantService } from './restaurant.service';
import { CheckoutPayload, PlaceOrderResponse } from '../interfaces/order.interface';
import { PaymentResult } from './payment/paymentStrategy.interface';
import { CartService } from './cart.service';
import { Transactional } from 'typeorm-transactional';
import {
	CalculateAmountsHandler,
	CheckoutContext,
	CreateOrderHandler,
	ProcessPaymentHandler,
	ValidateCartHandler,
	ValidateCustomerAddressHandler,
	ValidateCustomerHandler,
	ValidateRestaurantHandler
} from '../handlers/checkout';
import { CancellationInfo, OrderData, OrderHistoryResult, OrderItemResult } from '../dtos/order.dto';
import { TransactionService } from './transaction.service';
import { TransactionPaymentStatus } from '../enums/transaction.enum';
import { SettingKey } from '../enums/setting.enum';
import { SettingService } from './setting.service';

export class OrderService {
	private orderRepo = new OrderRepository();
	private cartService = new CartService();
	private customerService = new CustomerService();
	private restaurantService = new RestaurantService();
	private transactionService = new TransactionService();

	@Transactional()
	async checkout(payload: CheckoutPayload): Promise<PlaceOrderResponse> {
		const handler = new ValidateRestaurantHandler(this.restaurantService);
		handler
			.setNext(new ValidateCustomerHandler(this.customerService))
			.setNext(new ValidateCustomerAddressHandler(this.customerService))
			.setNext(new ValidateCartHandler(this.cartService))
			.setNext(new CalculateAmountsHandler())
			.setNext(new CreateOrderHandler(this.orderRepo))
			.setNext(new ProcessPaymentHandler());

		const context: CheckoutContext = { payload };
		const result = await handler.handle(context);

		return this.handlePaymentResult({
			processPaymentResult: result.processPaymentResult,
			order: result.order!,
			customer: result.customer!,
			restaurant: result.restaurant!,
			paymentMethod: result.payload.paymentMethod,
			transaction: result.transaction!
		});
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
		const order = await this.orderRepo.getOrderById(filter);

		if (!order) throw new ApplicationError(ErrMessages.order.OrderNotFound, StatusCodes.NOT_FOUND);
		return order;
	}

	@Transactional()
	private async handlePaymentResult(params: {
		processPaymentResult: PaymentResult;
		order: Order;
		paymentMethod: PaymentMethodEnum;
		customer: Customer;
		restaurant: Restaurant;
		transaction: Transaction;
	}): Promise<PlaceOrderResponse> {
		const { processPaymentResult, order, paymentMethod, customer, restaurant, transaction } = params;

		if (!processPaymentResult.success) {
			// todo: use update status & log method
			// order.status = OrderStatusEnum.failed;
			// await order.save();

			await this.updateOrderStatus(order.orderId, { status: OrderStatusEnum.failed }, OrderStatusChangeBy.payment);
			await this.transactionService.updateTransactionStatus({
				transactionId: transaction.transactionId,
				status: TransactionPaymentStatus.FAILED
			});
			await order.reload();

			return { success: false, error: processPaymentResult?.error, order };
		}

		// 3. Handle gateway redirects
		if (processPaymentResult?.redirectUrl) {
			await this.transactionService.updateTransactionStatus({
				transactionId: transaction.transactionId,
				status: TransactionPaymentStatus.PENDING
			});

			return {
				success: true,
				paymentReference: processPaymentResult.paymentId,
				paymentUrl: processPaymentResult.redirectUrl,
				order
			};
		}

		if (paymentMethod === PaymentMethodEnum.COD) {
			// todo: use update status & log method
			await this.finalizeOrderCOD(order, customer, restaurant, transaction);
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

	@Transactional()
	async finalizeOrderCOD(order: Order, customer: Customer, restaurant: Restaurant, transaction: Transaction) {
		// todo: use update status & log method
		// order.status = OrderStatusEnum.pending;
		order.placedAt = new Date(); // set placedAt to current date
		await order.save();
		await this.updateOrderStatus(order.orderId, { status: OrderStatusEnum.pending }, OrderStatusChangeBy.payment);
		await order.reload();

		await this.transactionService.updateTransactionStatus({
			transactionId: transaction.transactionId,
			status: TransactionPaymentStatus.PAID
		});

		await this.cartService.clearCart(customer.customerId);
		await this.sendingPlaceOrderNotifications(order, customer, restaurant);
	}

	@Transactional()
	async processPaypalPaymentCallback(orderId: number, paymentReference: string, isPaymentSuccess: boolean) {
		const order = await this.getOrderOrFailBy({ orderId, relations: ['restaurant'] });

		if (order.status !== OrderStatusEnum.initiated)
			throw new ApplicationError(ErrMessages.order.InvalidOrderStatus, StatusCodes.BAD_REQUEST);

		if (order.status !== OrderStatusEnum.initiated)
			throw new ApplicationError(ErrMessages.order.InvalidOrderStatus, StatusCodes.BAD_REQUEST);

		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId: order.customerId,
			relations: ['user']
		});

		// todo: use update status & log method
		const orderStatus = isPaymentSuccess ? OrderStatusEnum.pending : OrderStatusEnum.failed;
		const trxStatus = isPaymentSuccess ? TransactionPaymentStatus.PAID : TransactionPaymentStatus.FAILED;
		// await order.save();

		await this.updateOrderStatus(
			order.orderId,
			{ status: orderStatus, placedAt: isPaymentSuccess ? new Date() : undefined },
			OrderStatusChangeBy.payment
		);
		// order.placedAt = new Date();
		// order.status = orderStatus;
		// await order.save();
		await order.reload();

		// update transaction
		const transaction = await this.transactionService.getOneTransactionOrFailBy({ paymentReference });
		await this.transactionService.updateTransactionStatus({
			transactionId: transaction.transactionId,
			status: trxStatus
		});

		if (isPaymentSuccess) {
			await this.cartService.clearCart(customer.customerId);
			await this.sendingPlaceOrderNotifications(order, customer, order.restaurant);
			logger.info('Order payment confirmed', order.orderId);

			// TODO: update transaction status
			// await this.transactionService.updateTransactionStatus({
			// 	transactionId: transaction.transactionId,
			// 	status: TransactionPaymentStatus.SUCCESS
			// });
		} else {
			logger.info('Order payment failed', order.orderId);
		}
	}

	// === Status Validation Methods ===

	private getOrderStatusTransitions(): Record<
		OrderStatusEnum,
		{
			transitions: OrderStatusEnum[];
			actors: OrderStatusChangeBy[];
		}
	> {
		return {
			[OrderStatusEnum.initiated]: {
				transitions: [OrderStatusEnum.pending, OrderStatusEnum.failed],
				actors: [OrderStatusChangeBy.system]
			},
			[OrderStatusEnum.pending]: {
				transitions: [OrderStatusEnum.confirmed, OrderStatusEnum.canceled],
				actors: [OrderStatusChangeBy.payment, OrderStatusChangeBy.system]
			},
			[OrderStatusEnum.confirmed]: {
				transitions: [OrderStatusEnum.onTheWay, OrderStatusEnum.canceled, OrderStatusEnum.delivered],
				actors: [OrderStatusChangeBy.restaurant]
			},
			[OrderStatusEnum.onTheWay]: {
				transitions: [OrderStatusEnum.delivered],
				actors: [OrderStatusChangeBy.restaurant]
			},
			[OrderStatusEnum.canceled]: {
				transitions: [],
				actors: [OrderStatusChangeBy.system, OrderStatusChangeBy.restaurant]
			},
			[OrderStatusEnum.delivered]: {
				transitions: [],
				actors: [OrderStatusChangeBy.restaurant]
			},
			[OrderStatusEnum.failed]: {
				transitions: [],
				actors: [OrderStatusChangeBy.payment]
			}
		};
	}

	private validateStatusTransition(currentStatus: OrderStatusEnum, newStatus: OrderStatusEnum): void {
		const transitions = this.getOrderStatusTransitions();
		const allowedStatuses = transitions[currentStatus]?.transitions || [];

		if (!allowedStatuses.includes(newStatus)) {
			throw new ApplicationError(
				`Invalid order status transition from ${currentStatus} to ${newStatus}`,
				StatusCodes.BAD_REQUEST
			);
		}
	}

	private validateActorPermission(newStatus: OrderStatusEnum, actor: OrderStatusChangeBy): void {
		const transitions = this.getOrderStatusTransitions();
		const allowedActors = transitions[newStatus]?.actors || [];

		if (!allowedActors.includes(actor)) {
			throw new ApplicationError(
				`${actor} is not allowed to change order status to ${newStatus}`,
				StatusCodes.BAD_REQUEST
			);
		}
	}

	private validateCancelTime(date: Date): boolean {
		if (!isWithinCancelTimeLimit(date, 5)) {
			throw new ApplicationError(ErrMessages.order.CannotCancelOrderAfter5Minutes, StatusCodes.BAD_REQUEST);
		}
		return true;
	}

	private validateCancellationRules(order: Order, currentStatus: OrderStatusEnum, actor: OrderStatusChangeBy): void {
		const pendingStatusLog = order.orderStatusLogs.find((log) => log.status === OrderStatusEnum.pending);

		const canSystemCancelPending =
			currentStatus === OrderStatusEnum.pending &&
			actor === OrderStatusChangeBy.system &&
			this.validateCancelTime(pendingStatusLog?.createdAt!);

		const canRestaurantCancelConfirmed =
			currentStatus === OrderStatusEnum.confirmed && actor === OrderStatusChangeBy.restaurant;

		if (!(canSystemCancelPending || canRestaurantCancelConfirmed)) {
			throw new ApplicationError(
				`'${actor}' is not allowed to cancel an order in '${currentStatus}' status`,
				StatusCodes.BAD_REQUEST
			);
		}
	}

	// validate order status transition
	private async validateOrderStatus(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		const order = await this.getOrderOrFailBy({ orderId, relations: ['orderStatusLogs'] });
		const currentStatus = order.status;

		// Check if the transition is valid & actor is allowed to perform this transition
		this.validateStatusTransition(currentStatus, newStatus);
		this.validateActorPermission(newStatus, actor);

		// Specific checks for cancelation
		if (newStatus === OrderStatusEnum.canceled) {
			this.validateCancellationRules(order, currentStatus, actor);
		}
	}

	// === Update Order Status Methods ===

	private isValidActor(actor: OrderStatusChangeBy): asserts actor is OrderStatusChangeBy {
		const validActors = Object.values(OrderStatusChangeBy);
		if (!validActors.includes(actor)) {
			throw new ApplicationError(`Invalid actor: ${actor}`, StatusCodes.BAD_REQUEST);
		}
	}

	@Transactional()
	async addOrderStatusLog(orderId: number, newStatus: OrderStatusEnum, actor: OrderStatusChangeBy) {
		const orderStatusLog = await this.orderRepo.createOrderStatusLog({
			orderId,
			status: newStatus,
			changeBy: actor
		});
		if (!orderStatusLog)
			throw new ApplicationError(ErrMessages.order.FailedToAddOrderStatusLog, StatusCodes.INTERNAL_SERVER_ERROR);
		return orderStatusLog;
	}

	@Transactional()
	async updateOrderStatus(orderId: number, payload: Partial<Order>, actor: OrderStatusChangeBy) {
		this.isValidActor(actor);
		await this.validateOrderStatus(orderId, payload.status!, actor);
		await this.addOrderStatusLog(orderId, payload.status!, actor);
		const updatedOrder = await this.orderRepo.updateOrderStatus(orderId, payload);
		if (!updatedOrder)
			throw new ApplicationError(ErrMessages.order.FailedToUpdateOrderStatus, StatusCodes.INTERNAL_SERVER_ERROR);
		return updatedOrder;
	}

	// === Cancelation Methods ===

	private determineActorFromType(actorType: string): OrderStatusChangeBy {
		if (actorType.includes('customer')) {
			return OrderStatusChangeBy.system;
		} else if (actorType.includes('restaurant')) {
			return OrderStatusChangeBy.restaurant;
		}

		throw new ApplicationError(`${actorType} is not allowed to cancel an order`, StatusCodes.BAD_REQUEST);
	}

	@Transactional()
	async cancelOrder(orderId: number, actorType: string, payload: { reason: string }) {
		const actor = this.determineActorFromType(actorType);
		const cancellationInfo: CancellationInfo = {
			cancelledBy: actor,
			reason: payload.reason,
			cancelledAt: new Date()
		};
		return await this.updateOrderStatus(
			orderId,
			{
				status: OrderStatusEnum.canceled,
				cancellationInfo
			},
			actor
		);
	}

	// === Order History Methods ===

	private getActorSpecificData(order: Order, actorType: string): Record<string, any> {
		if (actorType === 'customer') {
			return {
				restaurant: {
					id: order.restaurantId,
					name: order.restaurant.name,
				}
			};
		}

		return {
			customer: {
				id: order.customerId,
				name: order.customer.user.name,
				phone: order.customer.user.phone
			}
		};
	}

	private getStatusRelatedData(order: Order): Record<string, any> {
		switch (order.status) {
			case OrderStatusEnum.canceled:
				return {
					placedAt: order.placedAt,
					cancellationInfo: order.cancellationInfo
				};
			case OrderStatusEnum.delivered:
				return {
					placedAt: order.placedAt,
					deliveredAt: order.deliveredAt
				};
			default:
				return {};
		}
	}

	private mapOrderItems(orderItems: OrderItem[]): OrderItemResult[] {
		return orderItems.map((item) => ({
			orderId: item.orderId,
			itemId: item.itemId,
			imagePath: item.item.imagePath,
			name: item.item.name,
			quantity: item.quantity,
			price: item.price,
			totalPrice: item.totalPrice
		}));
	}

	private formatOrderData(order: Order, actorType: string): OrderData {
		const actorData = this.getActorSpecificData(order, actorType);
		const statusData = this.getStatusRelatedData(order);
		const items = this.mapOrderItems(order.orderItems);

		return {
			orderId: order.orderId,
			status: order.status,
			...actorData,
			items,
			deliveryAddress: order.deliveryAddress,
			deliveryFees: order.deliveryFees,
			serviceFees: order.serviceFees,
			totalAmount: order.totalAmount,
			customerInstructions: order.customerInstructions,
			...statusData,
			paymentMethod: order.paymentMethod.code,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt
		};
	}

	async getOrdersHistory(
		actorType: string,
		actorId: number,
		limit: number,
		cursor?: string
	): Promise<OrderHistoryResult> {
		const orders = await this.orderRepo.getOrdersByActorId(actorId, actorType, limit, cursor);
		return {
			orders: orders.data.map((order) => this.formatOrderData(order, actorType)),
			nextCursor: orders.nextCursor,
			hasNextPage: orders.hasNextPage
		};
	}

	// === Order Summary and Details ===
	async getOrderSummary(orderId: number) {
		const order = await this.getOrderOrFailBy({ orderId, relations: ['orderItems'] });
		const orderSummary = await this.orderRepo.getOrderSummary(orderId);
		const totalItemsPrice = Cart.calculateTotalPrice(order.orderItems).toFixed(2);
		const totalAmount = Cart.calculateTotalPrice(order.orderItems, order.serviceFees, order.deliveryFees).toFixed(2);
		return { ...orderSummary, totalItemsPrice, totalAmount };
	}

	async getOrderDetails(orderId: number, actorType: string): Promise<OrderData> {
		const order = await this.getOrderOrFailBy({
			orderId,
			relations: ['restaurant', 'customer.user', 'orderItems.item', 'paymentMethod']
		});
		return this.formatOrderData(order, actorType);
	}

	// === Order Rating Methods ===
	async getAndValidateOrderForRating(orderId: number, customerId: number): Promise<Order> {
		const order = await this.getOrderOrFailBy({ orderId, relations: ['rating'] });

		await this.validateOrderForRating(order, customerId);

		return order;
	}

	private async validateOrderForRating(order: Order, customerId: number): Promise<void> {
		const validators = [
			() => this.validateOrderCompletion(order),
			() => this.validateExistingRating(order),
			() => this.validateCustomerAuthorization(order, customerId),
			async () => this.validateRatingTimeWindow(order)
		];

		for (const validator of validators) {
			await validator();
		}
	}

	private validateOrderCompletion(order: Order): void {
		if (order.status !== OrderStatusEnum.delivered) {
			throw new ApplicationError(ErrMessages.rating.OrderNotCompleted, StatusCodes.BAD_REQUEST);
		}
	}

	private validateExistingRating(order: Order): void {
		if (order.rating) {
			throw new ApplicationError(ErrMessages.rating.RatingAlreadyExists, StatusCodes.BAD_REQUEST);
		}
	}

	private validateCustomerAuthorization(order: Order, customerId: number): void {
		if (order.customerId !== customerId) {
			throw new ApplicationError(ErrMessages.order.UnauthorizedOrderAccess, StatusCodes.FORBIDDEN);
		}
	}

	private async validateRatingTimeWindow(order: Order): Promise<void> {
		const RATING_WINDOW = Number(await SettingService.get(SettingKey.ORDER_RATING_WINDOW_MIN));
		const deadline = new Date(order.placedAt);
		deadline.setMinutes(deadline.getMinutes() + RATING_WINDOW);

		const now = new Date();

		if (now > deadline) {
			throw new ApplicationError(ErrMessages.rating.RatingPeriodExpired, StatusCodes.BAD_REQUEST);
		}
	}

	async getActiveOrderByAddressId(addressId: number): Promise<Order | null> {
		return this.orderRepo.getActiveOrderBy(addressId);
	}

	async getActiveOrderByCustomerId(customerId: number): Promise<Order | null> {
		return this.orderRepo.getActiveOrderBy(customerId);
	}

	async getActiveOrderByRestaurantId(restaurantId: number): Promise<Order | null> {
		return this.orderRepo.getActiveOrderBy(restaurantId);
	}
}
