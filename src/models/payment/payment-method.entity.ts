import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from './transaction.entity';
import { PaymentMethodConfig } from './payment-method-config.entity';

@Entity()
export class PaymentMethod extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodId!: number;

	@Column({ type: 'varchar', length: 100, nullable: false })
	methodName!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ type: 'varchar', length: 255, default: '' })
	iconUrl!: string;

	@Column({ type: 'integer', default: 0, nullable: false })
	order!: number;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
	transactions!: Transaction[];

	@OneToMany(() => PaymentMethodConfig, (config) => config.paymentMethod)
	configs!: PaymentMethodConfig[];
}
