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
import { SettingService } from './setting.service';
import { SettingKey } from '../enums/setting.enum';

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
		await this.ensureAddressLimitNotExceeded(customerId);
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		await this.customerRepo.addAddress({ ...payload, customerId, isDefault: true });
	}

	@Transactional()
	async assignDefaultAddress(customerId: number, addressId: number) {
		await this.ensureCustomerOwnsAddress(customerId, addressId);
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		const address = await this.customerRepo.setDefaultAddress(addressId);
		return address;
	}

	@Transactional()
	async updateCustomerAddress(customerId: number, addressId: number, payload: Partial<Address>) {
		await this.ensureCustomerOwnsAddress(customerId, addressId);
		await this.ensureAddressNotUsedInActiveOrder(addressId);
		await this.handleDefaultAddressUpdateRules(customerId, addressId, payload);
		const updatedAddress = await this.customerRepo.updateAddress(addressId, { ...payload, customerId });
		return updatedAddress;
	}

	@Transactional()
	async deleteCustomerAddress(customerId: number, addressId: number) {
		await this.ensureCustomerOwnsAddress(customerId, addressId);
		await this.ensureAddressNotUsedInActiveOrder(addressId);
		await this.customerRepo.deleteAddress(addressId);
	}

	/* === Customer Deactivation === */

	@Transactional()
	async deactivateCustomer(userId: number, customerId: number, payload: Partial<User>, deactivatedBy: DeactivatedBy) {
		const deactivationInfo = { ...payload, deactivatedAt: new Date(), deactivatedBy };
		await this.ensureCustomerHasNoActiveOrders(customerId);
		await this.userService.deactivateUser(userId, deactivationInfo);
	}


	/* === Validation Methods === */

	async ensureCustomerOwnsAddress(customerId: number, addressId: number) {
		const address = await this.customerRepo.getAddressBy({ customerId, addressId });
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressDoesntBelongToCustomer, HttpStatusCode.NOT_FOUND);
		}
		return address;
	}

	private async ensureAddressLimitNotExceeded(customerId: number) {
		const addresses = await this.getCustomerAddresses(customerId);
		if (addresses.length === Number(await SettingService.get(SettingKey.MAX_CUSTOMER_ADDRESSES))) {
			throw new ApplicationError(ErrMessages.customer.ReachedAddressLimit, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async ensureNotRemovingOnlyDefaultAddress(customerId: number, addressId: number) {
		const defaultAddress = await this.customerRepo.getDefaultAddress(customerId);
		if (defaultAddress?.addressId === addressId) {
			throw new ApplicationError(ErrMessages.customer.AtLeastOneDefaultAddress, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async ensureAddressNotUsedInActiveOrder(addressId: number) {
		const activeOrder = await this.orderService.getActiveOrderByAddressId(addressId);
		if (activeOrder) {
			throw new ApplicationError(ErrMessages.customer.AddressUsedInActiveOrder, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async ensureCustomerHasNoActiveOrders(customerId: number) {
		const activeOrder = await this.orderService.getActiveOrderByCustomerId(customerId);
		if (activeOrder) {
			throw new ApplicationError(ErrMessages.customer.CustomerHasActiveOrder, HttpStatusCode.BAD_REQUEST);
		}
	}

	/* === Helper Methods === */

	async getCustomerByIdOrFail(filter: { customerId: number; relations?: CustomerRelations[] }) {
		const customer = await this.customerRepo.getCustomerBy(filter);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, HttpStatusCode.NOT_FOUND);
		return customer;
	}

	private async handleDefaultAddressUpdateRules(
		customerId: number,
		addressId: number,
		payload: Partial<Address>
	): Promise<void> {
		if (payload?.isDefault) {
			await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		} else {
			await this.ensureNotRemovingOnlyDefaultAddress(customerId, addressId);
		}
	}
}
