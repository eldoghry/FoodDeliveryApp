import { In, LessThan, Not, Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { OrderStatusChangeBy } from '../models';
import { OrderItem } from '../models/order/order-item.entity';
import { OrderStatusEnum, OrderStatusLog } from '../models/order/order-status_log.entity';
import { Order, OrderRelations } from '../models/order/order.entity';
import { cursorPaginate } from '../utils/helper';
import { PaginatedResultsDto } from '../dtos/shared.dto';

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

	async getOrdersByActorId(
		actorId: number,
		actorType: string,
		limit: number,
		cursor?: string
	): Promise<PaginatedResultsDto<Order>> {
		const whereCondition = actorType === 'customer' ? { customerId: actorId } : { restaurantId: actorId };

		// Build base where clause
		const whereClause: any = { ...whereCondition };

		// If cursor is provided, add condition to paginate
		if (cursor) {
			whereClause.createdAt = LessThan(new Date(cursor));
		}

		const orders = await this.orderRepo.find({
			where: whereClause,
			relations: ['restaurant', 'customer.user', 'orderItems.item', 'transaction.paymentMethod'],
			withDeleted: true,
			order: { createdAt: 'DESC' },
			take: limit + 1 // One extra to check for next page
		});

		return cursorPaginate(orders, limit, 'createdAt');
	}

	async updateOrderStatus(orderId: number, data: Partial<Order>): Promise<Partial<Order> | undefined> {
		await this.orderRepo.update(orderId, data);
		return await this.orderRepo
			.createQueryBuilder('o')
			.select(['o.order_id AS "orderId"', 'o.status AS "status"'])
			.where('o.order_id = :orderId', { orderId })
			.getRawOne();
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

	async getOrderById(filter: { orderId: number; relations?: OrderRelations[] }) {
		return await this.orderRepo.findOne({
			where: { orderId: filter.orderId },
			relations: filter.relations || []
		});
	}

	async getOrderStatusLogByOrderId(orderId: number): Promise<OrderStatusLog[]> {
		return await this.orderStatusLogRepo.find({
			where: { orderId }
		});
	}

	async getOrderSummary(orderId: number): Promise<any> {
		return this.orderRepo
			.createQueryBuilder('o')
			.select([
				'o.order_id AS "orderId"',
				'o.status AS "orderStatus"',
				'o.placed_at AS "placedAt"',
				'o.total_amount AS "totalAmount"',
				'restaurant.name'
			])
			.leftJoin('o.restaurant', 'restaurant')
			.where('o.order_id = :orderId', { orderId })
			.getRawOne();
	}

	async getManyOrdersBy(filter: {
		status?: OrderStatusEnum;
		restaurantId?: number;
		customerId?: number;
		createdBefore?: Date;
		relations?: OrderRelations[];
	}): Promise<Order[] | null> {
		const { relations, ...other } = filter;

		if (Object.keys(other).length === 0) return null;

		const query = this.orderRepo.createQueryBuilder('order');

		if (filter?.relations) {
			filter?.relations.forEach((relation) => query.leftJoinAndSelect(`order.${relation}`, relation));
		}

		if (other.customerId) {
			query.andWhere('order.customerId = :customerId', { customerId: other.customerId });
		}

		if (other.status) {
			query.andWhere('order.status = :status', { status: other.status });
		}

		if (other.restaurantId) {
			query.andWhere('order.restaurantId = :restaurantId', { restaurantId: other.restaurantId });
		}

		if (other.createdBefore) {
			query.andWhere('order.createdAt <= :createdBefore', { createdBefore: other.createdBefore });
		}

		return query.getMany();
	}

	async getActiveOrderBy(restaurantId?: number,customerId?: number,addressId?: number): Promise<Order | null> {
		const whereClause: any = {};
		if (restaurantId) whereClause.restaurantId = restaurantId;
		if (customerId) whereClause.customerId = customerId;
		if (addressId) whereClause.deliveryAddressId = addressId;
		return await this.orderRepo.findOne({
			where: { ...whereClause, status: Not(In([
				OrderStatusEnum.delivered,
				OrderStatusEnum.canceled,
				OrderStatusEnum.failed
			])) }
		});
	}
}
