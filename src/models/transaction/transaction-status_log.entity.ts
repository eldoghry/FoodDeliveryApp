import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { AbstractEntity } from '../base.entity';
import { TransactionPaymentStatus } from '../../enums/transaction.enum';

@Entity()
export class TransactionStatusLog extends AbstractEntity {
	@PrimaryGeneratedColumn()
	transactionStatusLogId!: number;

	@Column({ nullable: false })
	transactionId!: number;

	@ManyToOne(() => Transaction, (transaction) => transaction.transactionStatusLogs)
	@JoinColumn({ name: 'transaction_id' })
	transaction!: Transaction;

	@Column({
		type: 'enum',
		enum: TransactionPaymentStatus,
		default: TransactionPaymentStatus.INITIATED,
		nullable: false
	})
	status!: TransactionPaymentStatus;

	@CreateDateColumn()
	createdAt!: Date;
}
