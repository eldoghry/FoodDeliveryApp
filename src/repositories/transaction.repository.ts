import { AppDataSource } from '../config/data-source';
import { Transaction, TransactionRelations } from '../models/transaction/transaction.entity';
import { TransactionDetail } from '../models/transaction/transaction-detail.entity';
import { PaymentMethod } from '../models/payment_method/payment-method.entity';
import { Repository } from 'typeorm';
import { PaymentMethodStatus } from '../enums/payment_method.enum';
import { TransactionStatusLog } from '../models/transaction/transaction-status_log.entity';
import { generatePaymentReference } from '../utils/helper';
import { TransactionPaymentStatus } from '../enums/transaction.enum';

export class TransactionRepository {
	private transactionRepo: Repository<Transaction>;
	private transactionDetailRepo: Repository<TransactionDetail>;
	private transactionStatusLog: Repository<TransactionStatusLog>;

	constructor() {
		this.transactionRepo = AppDataSource.getRepository(Transaction);
		this.transactionDetailRepo = AppDataSource.getRepository(TransactionDetail);
		this.transactionStatusLog = AppDataSource.getRepository(TransactionStatusLog);
	}

	// Transaction operations
	async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
		const transaction = this.transactionRepo.create(data);

		return await this.transactionRepo.save(transaction);
	}

	async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<Transaction | null> {
		await this.transactionRepo.update(transactionId, data);
		return await this.getOneTransactionBy({ transactionId });
	}

	async updateTransactionStatus(data: {
		transactionId?: number;
		transactionReference?: string;
		status: TransactionPaymentStatus;
	}): Promise<Transaction | null> {
		const { transactionId, transactionReference, status } = data;

		if (!transactionId && !transactionReference) {
			throw new Error('Either transactionId or transactionReference must be provided');
		}

		const transaction = await this.getOneTransactionBy({
			transactionId,
			transactionReference
		});

		if (!transaction) {
			return null;
		}

		transaction.status = status;
		await this.transactionRepo.save(transaction);

		await this.addTransactionStatusLog(transaction.transactionId, status);

		return transaction;
	}

	async addTransactionStatusLog(transactionId: number, status: TransactionPaymentStatus): Promise<void> {
		const statusLog = this.transactionStatusLog.create({
			transactionId,
			status
		});

		await this.transactionStatusLog.save(statusLog);
	}

	// Transaction Detail operations
	async addTransactionDetail(data: Partial<TransactionDetail>): Promise<TransactionDetail> {
		const detail = this.transactionDetailRepo.create(data);
		return await this.transactionDetailRepo.save(detail);
	}

	async getTransactionDetails(transactionId: number): Promise<TransactionDetail[]> {
		return await this.transactionDetailRepo.find({
			where: { transactionId },
			relations: ['transaction']
		});
	}

	async getOneTransactionBy(filter: {
		transactionReference?: string;
		transactionId?: number;
		orderId?: number;
		paymentReference?: string;
		relations?: TransactionRelations[];
	}): Promise<Transaction | null> {
		const { relations, ...other } = filter;

		if (Object.keys(other).length === 0) return null;

		const query = this.transactionRepo.createQueryBuilder('transaction');

		if (filter?.relations) {
			filter?.relations.forEach((relation) => query.leftJoinAndSelect(`transaction.${relation}`, relation));
		}

		if (other.transactionId) {
			query.andWhere('transaction.transactionId = :transactionId', { transactionId: other.transactionId });
		}

		if (other.transactionReference) {
			query.andWhere('transaction.transactionReference = :transactionReference', {
				transactionReference: other.transactionReference
			});
		}

		if (other.orderId) {
			query.andWhere('transaction.orderId = :orderId', { orderId: other.orderId });
		}

		if (other.paymentReference) {
			query.andWhere('transaction.paymentReference = :paymentReference', {
				paymentReference: other.paymentReference
			});
		}

		return query.getOne();
	}

	async getManyTransactionBy(filter: {
		customerId?: number;
		paymentMethodCode?: number;
		relations?: TransactionRelations[];
	}): Promise<Transaction[] | null> {
		const { relations, ...other } = filter;

		if (Object.keys(other).length === 0) return null;

		const query = this.transactionRepo.createQueryBuilder('transaction');

		if (filter?.relations) {
			filter?.relations.forEach((relation) => query.leftJoinAndSelect(`transaction.${relation}`, relation));
		}

		if (other.customerId) {
			query.andWhere('transaction.customerId = :customerId', { customerId: other.customerId });
		}

		if (other.paymentMethodCode) {
			query.andWhere('transaction.paymentMethodCode = :paymentMethodCode', {
				paymentMethodCode: other.paymentMethodCode
			});
		}

		return query.getMany();
	}
}
