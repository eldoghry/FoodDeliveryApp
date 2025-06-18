import { StatusCodes as HttpStatusCode } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CustomerRepository, OrderRepository } from '../repositories';
import { Address, Customer, CustomerRelations } from '../models';
import { Transactional } from 'typeorm-transactional';
import { RatingService } from './rating.service';
import { CreateRatingDto } from '../dtos/rating.dto';
import { OrderService } from './order.service';

export class CustomerService {
	private customerRepo = new CustomerRepository();
	private orderRepo = new OrderRepository();
	private ratingService = new RatingService();
	private _orderService: OrderService | undefined = undefined;

	get orderService() {
		if (!this._orderService) {
			this._orderService = new OrderService();
		}
		return this._orderService;
	}

	async rateOrder(dto: CreateRatingDto) {
		const order = await this.orderService.getAndValidateOrderForRating(dto.orderId, dto.customerId);
		return this.ratingService.createRating({ ...dto, restaurantId: order.restaurantId });
	}

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
		const addresses = await this.customerRepo.getAddressesByCustomerId(customerId);
		return addresses;
	}

	private async validateAddress(customerId: number, addressId: number) {
		const address = await this.customerRepo.getAddressById(addressId);
		if (!address) {
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCode.NOT_FOUND);
		}

		if (address.customerId !== customerId) {
			throw new ApplicationError(ErrMessages.customer.AddressDoesntBelongToCustomer, HttpStatusCode.BAD_REQUEST);
		}
		return address;
	}

	@Transactional()
	async assignDefaultAddress(customerId: number, addressId: number) {
		await this.validateAddress(customerId, addressId);
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		const address = await this.customerRepo.setDefaultAddress(addressId);
		return address;
	}

	private async checkAddressLimitReached(customerId: number) {
		const addresses = await this.getCustomerAddresses(customerId);
		if (addresses.length === 10) {
			throw new ApplicationError(ErrMessages.customer.ReachedAddressLimit, HttpStatusCode.BAD_REQUEST);
		}
	}

	@Transactional()
	async createCustomerAddress(customerId: number, payload: Partial<Address>) {
		await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		await this.checkAddressLimitReached(customerId);
		await this.customerRepo.addAddress({ ...payload, customerId, isDefault: true });
	}

	async ensureAtLeastOneDefaultAddress(customerId: number, addressId: number) {
		const defaultAddress = await this.customerRepo.getDefaultAddress(customerId);
		if (defaultAddress?.addressId === addressId) {
			throw new ApplicationError(ErrMessages.customer.AtLeastOneDefaultAddress, HttpStatusCode.BAD_REQUEST);
		}
	}

	private async assertAddressNotInActiveOrder(addressId: number) {
        const activeOrder = await this.orderRepo.getActiveOrderByAddressId(addressId);
        if (activeOrder) {
            throw new ApplicationError(ErrMessages.customer.AddressIsUsed, HttpStatusCode.BAD_REQUEST);
        }
    }

	@Transactional()
	async updateCustomerAddress(customerId: number, addressId: number, payload: Partial<Address>) {
		await this.validateAddress(customerId, addressId);
		await this.assertAddressNotInActiveOrder(addressId);
		if (payload?.isDefault) {
			await this.customerRepo.unsetCustomerDefaultAddress(customerId);
		} else {
			await this.ensureAtLeastOneDefaultAddress(customerId, addressId);
		}

		const updatedAddress = await this.customerRepo.updateAddress(addressId, { ...payload, customerId });
		return updatedAddress;
	}

	@Transactional()
	async deleteCustomerAddress(customerId: number, addressId: number) {
		await this.validateAddress(customerId, addressId);
		await this.assertAddressNotInActiveOrder(addressId);
		await this.customerRepo.deleteAddress(addressId);
	}
}
