import { AppDataSource } from '../config/data-source';
import { Customer } from '../models/customer/customer.entity';
import { Address } from '../models/customer/address.entity';
import { Repository } from 'typeorm';
import { CustomerAddress } from '../models';

export class CustomerRepository {
	private customerRepo: Repository<Customer>;
	private addressRepo: Repository<Address>;
	private customerAddressRepo: Repository<CustomerAddress>;

	constructor() {
		this.customerRepo = AppDataSource.getRepository(Customer);
		this.addressRepo = AppDataSource.getRepository(Address);
		this.customerAddressRepo = AppDataSource.getRepository(CustomerAddress);
	}

	// Customer operations
	async createCustomer(data: Partial<Customer>): Promise<Customer> {
		const customer = this.customerRepo.create(data);
		return await this.customerRepo.save(customer);
	}

	async getCustomerById(customerId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { customerId }
		});
	}

	async getCustomerByUserId(userId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { userId }
		});
	}

	async updateCustomer(customerId: number, data: Partial<Customer>): Promise<Customer | null> {
		await this.customerRepo.update(customerId, data);
		return await this.getCustomerById(customerId);
	}

	// Address operations
	async addAddress(data: Partial<Address>): Promise<Address> {
		const address = this.addressRepo.create(data);
		return await this.addressRepo.save(address);
	}

	async getAddressById(addressId: number): Promise<Address | null> {
		return await this.addressRepo.findOne({
			where: { addressId }
		});
	}

	async getCustomerAddresses(customerId: number): Promise<CustomerAddress[]> {
		return await this.customerAddressRepo.find({
			where: { customerId },
			select: { addressId: true }
		});
	}

	async validateCustomerAddress(customerId: number, addressId: number): Promise<Address | null> {
		const customerAddress = await this.customerAddressRepo.findOne({ where: { customerId, addressId } });

		if (!customerAddress) return null;

		return await this.getAddressById(customerAddress.addressId);
	}

	async updateAddress(addressId: number, data: Partial<Address>): Promise<Address | null> {
		await this.addressRepo.update(addressId, data);
		return await this.getAddressById(addressId);
	}

	async deleteAddress(addressId: number): Promise<void> {
		await this.addressRepo.delete(addressId);
	}

	// Helper methods
	async getCustomerWithAddresses(customerId: number): Promise<Customer | null> {
		const customer = await this.getCustomerById(customerId);
		if (customer) {
			const addresses = await this.getCustomerAddresses(customerId);
			return { ...customer, addresses } as Customer & { addresses: CustomerAddress[] };
		}
		return null;
	}

	async searchCustomers(query: string): Promise<Customer[]> {
		return await this.customerRepo
			.createQueryBuilder('customer')
			.leftJoinAndSelect('customer.user', 'user')
			.where('user.firstName ILIKE :query', { query: `%${query}%` })
			.orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
			.orWhere('user.email ILIKE :query', { query: `%${query}%` })
			.getMany();
	}
}
