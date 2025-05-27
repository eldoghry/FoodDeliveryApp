import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	Check,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { PaymentMethod } from './payment-method.entity';
import { Order } from '../order/order.entity';
import { PaymentStatus } from './payment-status.entity';
import { TransactionDetail } from './transaction-detail.entity';


@Check(`"amount" >= 0.00`)
@Entity()
export class Transaction extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@Column({ nullable: false })
	paymentMethodId!: number;

	@ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;

	@Column({ nullable: false })
	orderId!: number;

	@ManyToOne(() => Order)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	amount!: number;

	@Column({ nullable: false })
	paymentStatusId!: number;

	@ManyToOne(() => PaymentStatus, (paymentStatus) => paymentStatus.transactions)
	@JoinColumn({ name: 'payment_status_id' })
	paymentStatus!: PaymentStatus;

	@Column({ type: 'varchar', length: 100, nullable: false })
	transactionCode!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => TransactionDetail, (detail) => detail.transaction)
	details!: TransactionDetail[];
}
