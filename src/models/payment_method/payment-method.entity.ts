import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Unique } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from '../transaction/transaction.entity';
import { PaymentMethodConfig } from './payment-method-config.entity';
import { PaymentMethodStatus } from '../../enums/payment_method.enum';
import { Order } from '../order/order.entity';

export enum PaymentMethodEnum {
	CARD = 'CARD',
	COD = 'COD'
}

@Entity()
@Unique(['code'])
export class PaymentMethod extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodId!: number;

	@Column({ type: 'varchar', length: 10, nullable: false })
	code!: string;

	@Column({ type: 'varchar', length: 100, nullable: false })
	description!: string;

	@Column({ type: 'varchar', length: 255, default: '' })
	iconUrl!: string;

	@Column({ type: 'integer', default: 0, nullable: false })
	order!: number;

	@Column({ enum: PaymentMethodStatus, default: PaymentMethodStatus.INACTIVE, nullable: false })
	status!: PaymentMethodStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
	transactions!: Transaction[];

	@OneToMany(() => PaymentMethodConfig, (config) => config.paymentMethod)
	configs!: PaymentMethodConfig[];

	@OneToMany(() => Order, (order) => order.paymentMethod)
	orders!: Order[];
}
