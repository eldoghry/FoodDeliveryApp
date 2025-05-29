import { AppDataSource } from '../config/data-source';
import { Order } from '../models/order/order.entity';
import { OrderItem } from '../models/order/order-item.entity';
import { OrderStatusLog } from '../models/order/order-status_log.entity';
import { Repository } from 'typeorm';
import { OrderStatusChangeBy } from '../models';

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
		const order = this.orderRepo.create(data);
		return await this.orderRepo.save(order);
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


	async cancelOrder(
		orderId: number,
		cancelledBy: OrderStatusChangeBy,
		reason: string
	): Promise<Order | null> {
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
