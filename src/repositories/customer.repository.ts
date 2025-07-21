import { AppDataSource } from '../config/data-source';
import { Customer, CustomerRelations } from '../models/customer/customer.entity';
import { Address } from '../models/customer/address.entity';
import { Repository } from 'typeorm';

interface CustomerFilter {
	customerId?: number;
	userId?: number;
	relations?: CustomerRelations[];
}
interface AddressFilter {
	addressId?: number;
	customerId?: number;
	relations?: string[];
	orderBy?: string;
	isDefault?: boolean;
}
export class CustomerRepository {
	private customerRepo: Repository<Customer>;
	private addressRepo: Repository<Address>;

	constructor() {
		this.customerRepo = AppDataSource.getRepository(Customer);
		this.addressRepo = AppDataSource.getRepository(Address);
	}

	/* === Customer operations === */

	async createCustomer(data: Partial<Customer>): Promise<Customer> {
		const customer = this.customerRepo.create(data);
		return await this.customerRepo.save(customer);
	}

	async getCustomerBy(filter: CustomerFilter): Promise<Customer | null> {
		const { relations, ...whereOptions } = filter;
		return await this.customerRepo.findOne({
			select: ['customerId'],
			where: whereOptions,
			relations: relations
		});
	}

	async getCustomerById(customerId: number){
		return await this.getCustomerBy({ customerId });
	}

	async getCustomerByUserId(userId: number): Promise<Customer | null> {
		return await this.getCustomerBy({ userId });
	}

	async updateCustomer(customerId: number, data: Partial<Customer>): Promise<Customer | null> {
		await this.customerRepo.update(customerId, data);
		return await this.getCustomerById(customerId);
	}

	/* === Address operations === */
	
	async addAddress(data: Partial<Address>): Promise<Address> {
		const address = this.addressRepo.create(data);
		return await this.addressRepo.save(address);
	}

	async getAddressBy(filter: AddressFilter): Promise<Address | null> {
		const { relations, orderBy, ...whereOptions } = filter;
		return await this.addressRepo.findOne({
			where: whereOptions,
			relations: relations,
			order: { [orderBy || 'createdAt']: 'DESC' }
		}); 
	}

	async getAddressById(addressId: number): Promise<Address | null> {
		return await this.getAddressBy({ addressId });
	}

	async getAddressesByCustomerId(customerId: number): Promise<Address[]> {
		return await this.addressRepo.find({
			where: { customerId },
			order: { createdAt: 'DESC' }
		});
	}

	async getDefaultAddress(customerId: number) {
		return await this.getAddressBy({ customerId, isDefault: true });
	}

	async unsetCustomerDefaultAddress(customerId: number) {
		const whereCondition = { customerId, isDefault: true };
		await this.addressRepo.update(whereCondition, { isDefault: false });
	}

	async setDefaultAddress(addressId: number) {
		await this.addressRepo.update(addressId, { isDefault: true });
		return await this.getAddressById(addressId);
	}

	async updateAddress(addressId: number, data: Partial<Address>): Promise<Address | null> {
		await this.addressRepo.update(addressId, data);
		return await this.getAddressById(addressId);
	}

	async deleteAddress(addressId: number): Promise<void> {
		await this.addressRepo.softDelete(addressId);
	}
}
