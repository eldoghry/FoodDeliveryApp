import { CartService } from './cart.service';
import { PaymentMethodEnum } from './../models/payment/payment-method.entity';
import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CustomerService } from './customer.service';
import { Paypal } from '../payment/paypal/paypal';
import { PaymentService } from '../payment/payment.service';

export class OrderService {
	private orderRepo = new OrderRepository();
	private cartService = new CartService();
	private customerService = new CustomerService();
	private dataSource = AppDataSource; // to be used for typeorm transactions
	private readonly paypalService = new Paypal(); // later use payment method

	async placeOrder(payload: {
		customerId: number;
		restaurantId: number;
		// cartId: number;
		addressId: number;
		paymentMethod: PaymentMethodEnum;
	}) {
		// const res = await this.paypalService.createOrder();
		// console.log(res);

		// return res;

		// get restaurant from restaurant service
		// get customer with address from customer service
		const customer = await this.customerService.getCustomerByIdOrFail({
			customerId: payload.customerId,
			relations: ['user', 'addresses']
		});

		if (customer.addresses.find((address) => address.addressId === payload.addressId) === undefined)
			throw new ApplicationError(ErrMessages.customer.AddressNotFound, HttpStatusCodes.NOT_FOUND);

		// get cart with items from cart service
		const cart = await this.cartService.getCartWithItems({ customerId: payload.customerId, relations: ['cartItems'] });

		if (!cart.cartItems.length) throw new ApplicationError(ErrMessages.cart.CartIsEmpty, HttpStatusCodes.BAD_REQUEST);

		const totalCartItemsAmounts = 100; // todo: get from helper
		const serviceFees = 10; // todo: get from helper
		const deliveryFees = 30; // todo: get from helper
		const totalAmount = totalCartItemsAmounts + serviceFees + deliveryFees;

		// create order and order items
		const order = await this.orderRepo.createOrder({
			restaurantId: payload.restaurantId,
			customerId: payload.customerId,
			deliveryAddressId: payload.addressId,
			deliveryFees,
			serviceFees,
			totalAmount,
			placedAt: new Date()
		});

		const paymentService = new PaymentService(payload.paymentMethod);
		const paymentResult = await paymentService.processPayment(totalAmount, {
			items: cart.cartItems
		});

		if (paymentResult.success) {
			// update order status
		}

		return { cart, customer };

		// get service fees from app setting service
		// validate payment method
		// create order
		// do payment
		// prepare response and return
	}
}
