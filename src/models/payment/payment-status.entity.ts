import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from './transaction.entity';

export enum PaymentStatusEnum {
	pending = 'pending',
	paid = 'paid',
	failed = 'failed',
	refunded = 'refunded'
}
@Entity()
export class PaymentStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentStatusId!: number;

	@Column({ type: 'varchar', length: 20 })
	statusName!: PaymentStatusEnum;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentStatus)
	transactions!: Transaction[];
}
