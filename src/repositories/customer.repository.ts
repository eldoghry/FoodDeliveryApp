import { AppDataSource } from '../config/data-source';
import { Customer, CustomerRelations } from '../models/customer/customer.entity';
import { Address } from '../models/customer/address.entity';
import { Repository } from 'typeorm';

export class CustomerRepository {
	private customerRepo: Repository<Customer>;
	private addressRepo: Repository<Address>;

	constructor() {
		this.customerRepo = AppDataSource.getRepository(Customer);
		this.addressRepo = AppDataSource.getRepository(Address);
	}

	// Customer operations
	async createCustomer(data: Partial<Customer>): Promise<Customer> {
		const customer = this.customerRepo.create(data);
		return await this.customerRepo.save(customer);
	}

	async getCustomerById(filter: { customerId: number; relations?: CustomerRelations[] }): Promise<Customer | null> {
		const query = this.customerRepo.createQueryBuilder('customer');

		if (filter?.relations) {
			filter.relations.forEach((relation) => query.leftJoinAndSelect(`customer.${relation}`, relation));
		}

		query.where('customer.customerId = :customerId', { customerId: filter.customerId });

		return query.getOne();
	}

	async getCustomerByUserId(userId: number): Promise<Customer | null> {
		return await this.customerRepo.findOne({
			where: { userId },
			relations: ['user']
		});
	}

	async updateCustomer(customerId: number, data: Partial<Customer>): Promise<Customer | null> {
		await this.customerRepo.update(customerId, data);
		return await this.getCustomerById({ customerId });
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

	async getAddressesByCustomerId(customerId: number): Promise<Address[]> {
		return await this.addressRepo.find({
			where: { customerId }
		});
	}

	async getDefaultAddress(customerId: number) {
		return await this.addressRepo.findOne({
			where: { customerId, isDefault: true }
		});
	}

	async unsetCustomerDefaultAddress(customerId: number) {
		const whereCondition = { customerId, isDefault: true };
		await this.addressRepo.update(whereCondition, { isDefault: false });
	}

	async setDefaultAddress(addressId: number) {
		await this.addressRepo.update(addressId, { isDefault: true });
	}

	async updateAddress(addressId: number, data: Partial<Address>): Promise<Address | null> {
		await this.addressRepo.update(addressId, data);
		return await this.getAddressById(addressId);
	}

	async deleteAddress(addressId: number): Promise<void> {
		await this.addressRepo.delete(addressId);
	}

	// Helper methods
	// async getCustomerWithAddresses(customerId: number): Promise<Customer | null> {
	// 	const customer = await this.getCustomerById(customerId);
	// 	if (customer) {
	// 		const addresses = await this.getAddressesByUserId(customer.userId);
	// 		return { ...customer, addresses } as Customer & { addresses: Address[] };
	// 	}
	// 	return null;
	// }

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
