import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { Transaction, TransactionDetail, TransactionRelations } from '../models';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Transactional } from 'typeorm-transactional';
import { TransactionPaymentStatus } from '../enums/transaction.enum';
import { generatePaymentReference } from '../utils/helper';
import { CreateTransactionDetailDto } from '../dtos/transaction.dto';

export class TransactionService {
	private transactionRepo = new TransactionRepository();

	@Transactional()
	async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
		const transactionReference = generatePaymentReference('TRX');

		const transaction = await this.transactionRepo.createTransaction({ ...data, transactionReference });

		if (!transaction) {
			logger.error('Failed to create transaction');
			throw new ApplicationError(ErrMessages.transaction.TransactionCreationFailed, StatusCodes.INTERNAL_SERVER_ERROR);
		}

		await this.addTransactionStatusLogByTrx(transaction, TransactionPaymentStatus.INITIATED);
		return transaction;
	}

	async getOneTransactionOrFailBy(filter: {
		transactionReference?: string;
		transactionId?: number;
		orderId?: number;
		paymentReference?: string;
		relations?: TransactionRelations[];
	}) {
		const transaction = await this.transactionRepo.getOneTransactionBy(filter);

		if (!transaction) {
			logger.error('Failed to create transaction');
			throw new ApplicationError(ErrMessages.transaction.TransactionNotFound, StatusCodes.NOT_FOUND);
		}

		return transaction;
	}

	@Transactional()
	async updateTransactionStatus(data: {
		transactionId: number;
		transactionReference?: string;
		paymentReference?: string;
		status: TransactionPaymentStatus;
	}): Promise<Transaction | null> {
		const { status, ...filter } = data;

		if (!Object.keys(filter).length) {
			throw new ApplicationError(ErrMessages.transaction.TransactionIdOrReferenceRequired, HttpStatusCodes.BAD_REQUEST);
		}

		const transaction = await this.getOneTransactionOrFailBy(filter);

		transaction.status = status;
		await this.addTransactionStatusLogByTrx(transaction, status);
		await transaction.save();
		await transaction.reload();
		return transaction;
	}

	// private async addTransactionStatusLogById(transactionId: number, status: TransactionPaymentStatus): Promise<void> {
	// 	const transaction = await this.transactionRepo.getOneTransactionBy({ transactionId });

	// 	if (!transaction) {
	// 		logger.error(`Transaction with ID ${transactionId} not found`);
	// 		throw new ApplicationError(ErrMessages.transaction.TransactionNotFound, HttpStatusCodes.NOT_FOUND);
	// 	}

	// 	await this.transactionRepo.addTransactionStatusLog(transactionId, status);
	// 	logger.info(`Transaction status log created for transaction ID ${transactionId} with status ${status}`);
	// }

	private async addTransactionStatusLogByTrx(
		transaction: Transaction,
		status: TransactionPaymentStatus
	): Promise<void> {
		await this.transactionRepo.addTransactionStatusLog(transaction.transactionId, status);
		logger.info(`Transaction status log created for transaction ID ${transaction.transactionId} with status ${status}`);
	}

	async createTransactionDetail(detail: CreateTransactionDetailDto): Promise<TransactionDetail> {
		return this.transactionRepo.createTransactionDetail(detail);
	}

	async updateTransactionPaymentReference(transactionId: number, paymentReference: string) {
		return this.transactionRepo.updateTransaction(transactionId, { paymentReference });
	}
}
