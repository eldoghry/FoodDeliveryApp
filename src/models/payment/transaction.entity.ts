import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Customer } from '../customer/customer.entity';
import { PaymentMethod } from './payment-method.entity';
import { Order } from '../order/order.entity';
import { PaymentStatus } from './payment-status.entity';

@Entity()
export class Transaction extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionId!: number;

	@Column()
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn()
	customer!: Customer;

	@Column()
	paymentMethodId!: number;

	@ManyToOne(() => PaymentMethod)
	@JoinColumn()
	paymentMethod!: PaymentMethod;

	@Column()
	orderId!: number;

	@ManyToOne(() => Order)
	@JoinColumn()
	order!: Order;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	amount!: number;

	@Column()
	paymentStatusId!: number;

	@ManyToOne(() => PaymentStatus)
	@JoinColumn()
	paymentStatus!: PaymentStatus;

	@Column({ length: 100 })
	transactionCode!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
