import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	Check,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	OneToOne
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { PaymentMethod, PaymentMethodEnum } from '../payment_method/payment-method.entity';
import { Order } from '../order/order.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { TransactionPaymentStatus } from '../../enums/transaction.enum';
import { TransactionStatusLog } from './transaction-status_log.entity';

export type TransactionRelations = 'transactionStatusLogs' | 'details' | 'order' | 'paymentMethod';

@Check(`"amount" >= 0.00`)
@Entity()
export class Transaction extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@Column({ nullable: false, enum: PaymentMethodEnum })
	paymentMethodCode!: PaymentMethodEnum;

	@Column({ nullable: false })
	orderId!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	amount!: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	transactionReference!: string;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: true })
	paymentReference!: string;

	@Column({ nullable: false, enum: TransactionPaymentStatus })
	status!: TransactionPaymentStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	// ****** RELATIONS ******

	@OneToMany(() => TransactionDetail, (detail) => detail.transaction)
	details!: TransactionDetail[];

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;

	@OneToOne(() => Order, (order) => order.transaction)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@OneToMany(() => TransactionStatusLog, (transactionStatusLog) => transactionStatusLog.transaction)
	transactionStatusLogs!: TransactionStatusLog[];
}
