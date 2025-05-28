import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	Check
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { OrderStatusEnum, OrderStatusLog } from './order-status_log.entity';
import { Customer } from '../customer/customer.entity';
import { Address } from '../customer/address.entity';
import { OrderItem } from './order-item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Check(`"delivery_fees" >= 0.00`)
@Check(`"service_fees" >= 0.00`)
@Check(`"total_amount" >= 0.00`)
@Entity()
export class Order extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderId!: number;

	@Column({ nullable: false })
	restaurantId!: number;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@Column({ nullable: false })
	customerId!: number;

	@ManyToOne(() => Customer, (customer) => customer.orders)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@Column({ nullable: false })
	deliveryAddressId!: number;

	@ManyToOne(() => Address, (address) => address.orders)
	@JoinColumn({ name: 'delivery_address_id' })
	deliveryAddress!: Address;

	@Column({ type: 'enum', enum: OrderStatusEnum, nullable: false, default: OrderStatusEnum.initiated })
	status!: OrderStatusEnum;

	@Column({ type: 'text', default: '' })
	customerInstructions!: string;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
	deliveryFees!: number;

	@Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
	serviceFees!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	totalAmount!: number;

	@Column({ type: 'timestamp', nullable: true })
	placedAt!: Date;

	@Column({ type: 'timestamp', nullable: true })
	deliveredAt!: Date;

	@Column({ type: 'jsonb', nullable: true })
	cancellationInfo!: Record<string, any>; // {canceledBy: user-1, cancelReason: "wrong order"}

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	orderItems!: OrderItem[];

	@OneToMany(() => OrderStatusLog, (orderStatusLog) => orderStatusLog.order)
	orderStatusLogs!: OrderStatusLog[];
}
