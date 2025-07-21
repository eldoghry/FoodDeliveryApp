import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { AbstractEntity } from '../base.entity';

export enum OrderStatusEnum {
	initiated = 'initiated', // order initiated and waiting for payment
	pending = 'pending', // order placed and successfully paid and waiting restaurant confirmation
	confirmed = 'confirmed', // restaurant accept order
	onTheWay = 'onTheWay', // restaurant is finished and order is ready to pickup
	delivered = 'delivered', //[terminal state] order delivered to customer
	canceled = 'canceled', // [terminal state] order canceled by customer or restaurant
	failed = 'failed' //[terminal state] order failed for any reason like payment failed
}

export enum OrderStatusChangeBy {
	system = 'system',
	restaurant = 'restaurant',
	payment = 'payment'
}

@Entity()
@Index('idx_order_status_log_order_id',['orderId'])
export class OrderStatusLog extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderStatusLogId!: number;

	@Column({ nullable: false })
	orderId!: number;

	@ManyToOne(() => Order, (order) => order.orderStatusLogs)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column({ type: 'enum' , enum: OrderStatusEnum,default: OrderStatusEnum.initiated, nullable: false })
	status!: OrderStatusEnum;

	@Column({ type: 'enum' , enum: OrderStatusChangeBy,default: OrderStatusChangeBy.system, nullable: false })
	changeBy!: OrderStatusChangeBy;

	@CreateDateColumn()
	createdAt!: Date;
}
