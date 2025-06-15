import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CustomerRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { Customer, CustomerRelations } from '../models';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async getCustomerByIdOrFail(filter: { customerId: number; relations?: CustomerRelations[] }) {
		const customer = await this.customerRepo.getCustomerById(filter);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, HttpStatusCodes.NOT_FOUND);
		return customer;
	}

	async validateCustomerAddress(customer: Customer, addressId: number) {
		const hasAddress = customer.addresses.some((address) => address.addressId === addressId);

		if (!hasAddress) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCodes.NOT_FOUND);
		}
	}
}
