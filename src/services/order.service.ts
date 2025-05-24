import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';

export class OrderService {
	private orderRepo = new OrderRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async placeOrder() {}
}
