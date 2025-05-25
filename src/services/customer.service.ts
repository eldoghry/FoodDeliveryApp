import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CustomerRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerRelations } from '../models';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async getCustomerByIdOrFail(filter: { customerId: number; relations?: CustomerRelations[] }) {
		const customer = await this.customerRepo.getCustomerById(filter);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, HttpStatusCodes.NOT_FOUND);
		return customer;
	}
}
