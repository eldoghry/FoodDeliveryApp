import { In, LessThan, Not, Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
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
		const query = this.orderRepo.createQueryBuilder('order')
		 .select([
			'order',
			'restaurant.name',
			'customer.customerId',
			'customer.userId',
			'user.name',
			'user.phone',
			'orderItems',
			'item.imagePath',
			'item.name',
			'paymentMethod.code'
		  ])
		  .leftJoin('order.restaurant', 'restaurant')
		  .leftJoin('order.customer', 'customer')
		  .leftJoin('customer.user', 'user')
		  .leftJoin('order.orderItems', 'orderItems')
		  .leftJoin('orderItems.item', 'item')
		  .leftJoin('order.paymentMethod', 'paymentMethod')
		  .where(actorType === 'customer' ? 'order.customer_id = :actorId' : 'order.restaurant_id = :actorId', { actorId })
		  .orderBy('order.createdAt', 'DESC')
		  .take(limit + 1);
	  
		if (cursor) {
		  query.andWhere('order.createdAt < :cursor', { cursor: new Date(cursor) });
		}
	  
		const orders = await query.getMany();
	  
		
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


	// Order Status Log operations

	async createOrderStatusLog(data: Partial<OrderStatusLog>): Promise<OrderStatusLog> {
		const orderStatusLog = this.orderStatusLogRepo.create(data);
		return await this.orderStatusLogRepo.save(orderStatusLog);
	}

	async getOrderById(filter: { orderId: number; relations?: OrderRelations[] }) {
		return await this.orderRepo.findOne({
			where: { orderId: filter.orderId },
			relations: filter.relations || []
		});
	}

	async getOrderSummary(orderId: number): Promise<any> {
		const query= this.orderRepo
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
			return query.getRawOne();
	}

	async getActiveOrderBy(orderId?: number, restaurantId?: number, customerId?: number, addressId?: number): Promise<Order | null> {
		const excludedStatuses = [
			OrderStatusEnum.delivered,
			OrderStatusEnum.canceled,
			OrderStatusEnum.failed
		];
		return await this.orderRepo.findOne({
			select: ['orderId'],
			where: {
			  ...(orderId && { orderId }),
			  ...(restaurantId && { restaurantId }),
			  ...(customerId && { customerId }),
			  ...(addressId && { deliveryAddressId: addressId }),
			  status: Not(In(excludedStatuses))
			}
		  });
	}
}