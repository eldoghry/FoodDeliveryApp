import { StatusCodes as HttpStatusCode } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CustomerRepository } from '../repositories';
import { Customer, CustomerRelations } from '../models';
import { Transactional } from 'typeorm-transactional';


export class CustomerService {
	private customerRepo = new CustomerRepository();

	async getCustomerByIdOrFail(filter: { customerId: number; relations?: CustomerRelations[] }) {
		const customer = await this.customerRepo.getCustomerById(filter);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, HttpStatusCode.NOT_FOUND);
		return customer;
	}

	async validateCustomerAddress(customer: Customer, addressId: number) {
		const hasAddress = customer.addresses.some((address) => address.addressId === addressId);

		if (!hasAddress) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCode.NOT_FOUND);
		}
	}
}
