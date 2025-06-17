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

	async getCustomerAddresses(customerId: number) {
		return await this.customerRepo.getAddressesByCustomerId(customerId);
	}

	// @Transactional()
	// async assignDefaultAddress(addressId: number) {
	// 	await this.customerRepo.setDefaultAddress(addressId);
	// }

	private async checkAddressLimitReached(customerId: number) {
		const address = await this.getCustomerAddresses(customerId);
		if (address.length === 10) {
			throw new ApplicationError(ErrMessages.customer.ReachedAddressLimit, HttpStatusCode.BAD_REQUEST);
		}
	}

	@Transactional()
	async createCustomerAddress(payload: any) {
		const customerId = payload.customerId;
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		await this.checkAddressLimitReached(customerId);
		await this.customerRepo.addAddress({ ...payload, isDefault: true });
	}
}
