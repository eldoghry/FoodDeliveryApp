import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	Check,
	OneToOne,
	Index
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { OrderStatusEnum, OrderStatusLog } from './order-status_log.entity';
import { Customer } from '../customer/customer.entity';
import { Address } from '../customer/address.entity';
import { OrderItem } from './order-item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Transaction } from '../transaction/transaction.entity';
import { Rating } from '../rating/rating.entity';
import { PaymentMethod } from '../payment_method/payment-method.entity';

export type OrderRelations =
	| 'orderStatusLogs'
	| 'orderItems'
	| 'deliveryAddress'
	| 'restaurant'
	| 'customer'
	| 'transactions'
	| 'customer.user'
	| 'orderItems.item'
	| 'paymentMethod'
	| 'rating';

@Check(`"delivery_fees" >= 0.00`)
@Check(`"service_fees" >= 0.00`)
@Check(`"total_amount" >= 0.00`)
@Entity()
@Index('idx_order_customer_createdat', ['customerId', 'createdAt'])
@Index('idx_order_restaurant_id', ['restaurantId'])
@Index('idx_order_status', ['status'])
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

	@Column({ nullable: false })
	paymentMethodId!: number;

	@Column({ nullable: false })
	deliveryAddressId!: number;

	@Column({ type: 'jsonb', nullable: false })
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
	cancellationInfo!: Record<string, any>; // {canceledBy: user-1, reason: "wrong order", canceledAt: "2025-05-29 22:25:54.819"}

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	orderItems!: OrderItem[];

	@OneToMany(() => OrderStatusLog, (orderStatusLog) => orderStatusLog.order)
	orderStatusLogs!: OrderStatusLog[];

	@OneToOne(() => Transaction, (transaction) => transaction.order)
	transaction!: Transaction;

	@OneToOne(() => Rating, (rating) => rating.order)
	rating!: Rating;

	@ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.orders)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;

	@ManyToOne(() => Customer, (customer) => customer.orders)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;
}
