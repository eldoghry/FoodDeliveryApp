import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';

export class OrderService {
	private orderRepo = new OrderRepository();
	private cartService = new CartService();
	private customerService = new CustomerService();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	async placeOrder(payload: {
		customerId: number;
		restaurantId: number;
		// cartId: number;
		addressId: number;
		paymentMethod: PaymentMethodEnum;
	}) {
		// get restaurant from restaurant service
		// get customer with address from customer service
		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId: payload.customerId,
			relations: ['user', 'addresses']
		});

		if (customer.addresses.find((address) => address.addressId === payload.addressId) === undefined)
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCodes.NOT_FOUND);

		// get customer address from customer service
		// get cart with items from cart service
		const cart = await this.cartService.getCartWithItems({ customerId: payload.customerId, relations: ['cartItems'] });

		return { cart, customer };

		// get service fees from app setting service
		// validate payment method
		// create order
		// do payment
		// prepare response and return
	}
}
