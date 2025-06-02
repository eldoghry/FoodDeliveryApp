import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { OrderStatusChangeBy } from '../models';
import { OrderItem } from '../models/order/order-item.entity';
import { OrderStatusEnum, OrderStatusLog } from '../models/order/order-status_log.entity';
import { Order, OrderRelations } from '../models/order/order.entity';

export class OrderRepository {
	private orderRepo: Repository<Order>;
	private orderItemRepo: Repository<OrderItem>;
	private orderStatusLogRepo: Repository<OrderStatusLog>;

	constructor() {
		this.orderRepo = AppDataSource.getRepository(Order);
		this.orderItemRepo = AppDataSource.getRepository(OrderItem);
		this.orderStatusLogRepo = AppDataSource.getRepository(OrderStatusLog);
	}

	// Order operations
	async createOrder(data: Partial<Order>): Promise<Order> {
		const order = await this.orderRepo.create(data).save();
		await this.createOrderStatusLog({ orderId: order.orderId, status: OrderStatusEnum.initiated });
		return order;
	}

	async getOrderById(orderId: number): Promise<Order | null> {
		return await this.orderRepo.findOne({
			where: { orderId },
			relations: ['orderStatusLogs', 'restaurant', 'customer', 'deliveryAddress', 'orderItems']
		});
	}

	async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
		return await this.orderRepo.find({
			where: { customerId },
			relations: ['orderStatusLogs', 'restaurant', 'customer', 'deliveryAddress', 'orderItems'],
			order: { createdAt: 'DESC' }
		});
	}

	async updateOrder(orderId: number, data: Partial<Order>): Promise<Order | null> {
		await this.orderRepo.update(orderId, data);
		return await this.getOrderById(orderId);
	}

	async updateOrderStatus(orderId: number, status: OrderStatusEnum): Promise<Partial<Order> | undefined> {
		await this.orderRepo.update(orderId, { status });
		return await this.orderRepo
			.createQueryBuilder('o')
			.select(['o.order_id AS "orderId"', 'o.status AS "status"'])
			.where('o.order_id = :orderId', { orderId })
			.getRawOne();
	}

	async cancelOrder(orderId: number, cancelledBy: OrderStatusChangeBy, reason: string): Promise<Order | null> {
		const order = await this.getOrderById(orderId);
		if (!order) return null;

		order.cancellationInfo = {
			cancelledBy,
			reason,
			cancelledAt: new Date()
		};

		return await this.orderRepo.save(order);
	}

	// Order Item operations
	async addOrderItem(data: Partial<OrderItem>): Promise<OrderItem> {
		const orderItem = this.orderItemRepo.create(data);
		return await this.orderItemRepo.save(orderItem);
	}

	async getOrderItems(orderId: number): Promise<OrderItem[]> {
		return await this.orderItemRepo.find({
			where: { orderId },
			relations: ['item']
		});
	}

	async getOrderItem(orderItemId: number): Promise<OrderItem | null> {
		return await this.orderItemRepo.findOne({
			where: { orderItemId },
			relations: ['item']
		});
	}

	// Order Status Log operations

	async createOrderStatusLog(data: Partial<OrderStatusLog>): Promise<OrderStatusLog> {
		const orderStatusLog = this.orderStatusLogRepo.create(data);
		return await this.orderStatusLogRepo.save(orderStatusLog);
	}

	async getAllOrderStatusLogs(): Promise<OrderStatusLog[]> {
		return await this.orderStatusLogRepo.find();
	}

	async getOrderStatusLogById(orderStatusLogId: number): Promise<OrderStatusLog | null> {
		return await this.orderStatusLogRepo.findOne({
			where: { orderStatusLogId }
		});
	}

	async getOrderBy(filter: { orderId: number; relations?: OrderRelations[] }) {
		if (Object.keys(filter).length === 0) return null;

		const { relations, ...whereCondition } = filter;

		return await this.orderRepo.findOne({ where: whereCondition, relations });
	}

	async getOrderStatusLogByOrderId(orderId: number): Promise<OrderStatusLog[]> {
		return await this.orderStatusLogRepo.find({
			where: { orderId }
		});
	}

	async getOrderDetails(orderId: number, customerId: number) {
		console.log({ customerId });
		const order = await this.orderRepo.findOne({
			where: { orderId, customerId },
			relations: ['restaurant', 'customer', 'deliveryAddress', 'orderStatusLogs', 'orderItems.item']
		});

		if (!order) return null;

		// const orderItems = await this.orderItemRepo.find({
		// 	where: { orderId },
		// 	relations: ['item']
		// });

		return {
			orderId: order.orderId,
			restaurantId: order.restaurantId,
			deliveryAddressId: order.deliveryAddressId,
			status: order.status,
			customerInstructions: order.customerInstructions,
			deliveryFees: order.deliveryFees,
			serviceFees: order.serviceFees,
			totalAmount: order.totalAmount,
			placedAt: order.placedAt,
			deliveredAt: order.deliveredAt,
			cancellationInfo: order.cancellationInfo,
			customerId: order.customerId,
			orderItems: order.orderItems,
			orderStatusLogs: order.orderStatusLogs,
			restaurant: {
				id: order.restaurant?.restaurantId,
				name: order.restaurant?.name,
				logoUrl: order.restaurant?.logoUrl,
				bannerUrl: order.restaurant?.bannerUrl
			},
			deliveryAddress: {
				id: order.deliveryAddress?.addressId,
				addressLine1: order.deliveryAddress?.addressLine1,
				addressLine2: order.deliveryAddress?.addressId
			},
			createdAt: order.createdAt,
			updatedAt: order.updatedAt
		};
	}

	// Helper methods
	// async calculateOrderTotal(orderId: number): Promise<number> {
	// 	const orderItems = await this.getOrderItems(orderId);
	// 	return orderItems.reduce((total, item) => total + item.totalPrice, 0);
	// }

	// async updateOrderTotalItems(orderId: number): Promise<void> {
	// 	const orderItems = await this.getOrderItems(orderId);
	// 	const totalItems = orderItems.reduce((total, item) => total + item.quantity, 0);
	// 	await this.updateOrder(orderId, { totalItems });
	// }
}
