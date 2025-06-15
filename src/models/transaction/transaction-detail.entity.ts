import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class TransactionDetail extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionDetailId!: number;

	@Column({ nullable: false })
	transactionId!: number;

	@ManyToOne(() => Transaction)
	@JoinColumn({ name: 'transaction_id' })
	transaction!: Transaction;

	@Column({ type: 'varchar', length: 100 })
	provider!: string; // e.g., 'Fawry', 'Stripe'

	@Column({ type: 'varchar', length: 50 })
	action!: string; // e.g., 'charge', 'verify', 'refund'

	@Column({ type: 'jsonb', nullable: true })
	requestPayload?: Record<string, any>;

	@Column({ type: 'jsonb', nullable: true })
	responsePayload?: Record<string, any>;

	@Column({ default: true })
	success!: boolean;

	@Column({ type: 'text', nullable: true })
	errorMessage?: string;

	@CreateDateColumn()
	createdAt!: Date;
}
