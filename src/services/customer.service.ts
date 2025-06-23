import { UserService } from './user.service';
import { StatusCodes as HttpStatusCode } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CustomerRepository } from '../repositories';
import { Address, CustomerRelations, DeactivatedBy, User } from '../models';
import { Transactional } from 'typeorm-transactional';
import { RatingService } from './rating.service';
import { CreateRatingDto } from '../dtos/rating.dto';
import { OrderService } from './order.service';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private userService = new UserService();
	private ratingService = new RatingService();
	private _orderService: OrderService | undefined = undefined;

	get orderService() {
		if (!this._orderService) {
			this._orderService = new OrderService();
		}
		return this._orderService;
	}

	/* === Rate Order === */

	async rateOrder(dto: CreateRatingDto) {
		const order = await this.orderService.getAndValidateOrderForRating(dto.orderId, dto.customerId);
		return this.ratingService.createRating({ ...dto, restaurantId: order.restaurantId });
	}

	/* === Customer Address CRUD Operations === */

	async getCustomerAddresses(customerId: number) {
		const addresses = await this.customerRepo.getAddressesByCustomerId(customerId);
		return addresses;
	}

	@Transactional()
	async createCustomerAddress(customerId: number, payload: Partial<Address>) {
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		await this.validateAddressLimit(customerId);
		await this.customerRepo.addAddress({ ...payload, customerId, isDefault: true });
	}

	@Transactional()
	async assignDefaultAddress(customerId: number, addressId: number) {
		await this.validateCustomerAddress(customerId, addressId);
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		const address = await this.customerRepo.setDefaultAddress(addressId);
		return address;
	}

	@Transactional()
	async updateCustomerAddress(customerId: number, addressId: number, payload: Partial<Address>) {
		await this.validateAddressOperation(customerId, addressId);
		await this.handleDefaultAddressChange(customerId, addressId, payload);
		const updatedAddress = await this.customerRepo.updateAddress(addressId, { ...payload, customerId });
		return updatedAddress;
	}

	@Transactional()
	async deleteCustomerAddress(customerId: number, addressId: number) {
		await this.validateAddressOperation(customerId, addressId);
		await this.customerRepo.deleteAddress(addressId);
	}

	/* === Customer Deactivation === */

	@Transactional()
	async deactivateCustomer(userId: number, customerId: number, payload: Partial<User>, deactivatedBy: DeactivatedBy) {
		const deactivationInfo = { ...payload, deactivatedAt: new Date(), deactivatedBy };
		await this.validateCustomerDeactivation(customerId);
		await this.userService.deactivateUser(userId, deactivationInfo);
	}


	/* === Validation Methods === */

	async validateCustomerAddress(customerId: number, addressId: number) {
		const address = await this.customerRepo.getAddressById(addressId);
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCode.NOT_FOUND);
		}

		if (address.customerId !== customerId) {
			throw new ApplicationError(ErrMessages.customer.AddressDoesntBelongToCustomer, HttpStatusCode.BAD_REQUEST);
		}
		return address;
	}

	private async validateAddressLimit(customerId: number) {
		const addresses = await this.getCustomerAddresses(customerId);
		if (addresses.length === 10) {
			throw new ApplicationError(ErrMessages.customer.ReachedAddressLimit, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async validateNotLastDefaultAddress(customerId: number, addressId: number) {
		const defaultAddress = await this.customerRepo.getDefaultAddress(customerId);
		if (defaultAddress?.addressId === addressId) {
			throw new ApplicationError(ErrMessages.customer.AtLeastOneDefaultAddress, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async validateAddressNotInActiveOrder(addressId: number) {
		// TODO: check me
		const activeOrder = await this.orderService.getActiveOrderByAddressId(addressId);
		if (activeOrder) {
			throw new ApplicationError(ErrMessages.customer.AddressIsUsed, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async validateAddressOperation(customerId: number, addressId: number) {
		await this.validateCustomerAddress(customerId, addressId);
		await this.validateAddressNotInActiveOrder(addressId);
	}

	private async validateCustomerDeactivation(customerId: number) {
		const activeOrder = await this.orderService.getActiveOrderByCustomerId(customerId);
		if (activeOrder) {
			throw new ApplicationError(ErrMessages.customer.CustomerIsUsed, HttpStatusCode.BAD_REQUEST);
		}
	}

	/* === Helper Methods === */

	async getCustomerByIdOrFail(filter: { customerId: number; relations?: CustomerRelations[] }) {
		const customer = await this.customerRepo.getCustomerById(filter);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, HttpStatusCode.NOT_FOUND);
		return customer;
	}

	private async handleDefaultAddressChange(
		customerId: number,
		addressId: number,
		payload: Partial<Address>
	): Promise<void> {
		if (payload?.isDefault) {
			await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		} else {
			await this.validateNotLastDefaultAddress(customerId, addressId);
		}
	}
}
