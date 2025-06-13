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

	@Column({ type: 'jsonb', nullable: false })
	detailKey!: Record<string, any>;

	@Column({ type: 'jsonb', nullable: false })
	detailValue!: Record<string, any>;

	@CreateDateColumn()
	createdAt!: Date;
}
