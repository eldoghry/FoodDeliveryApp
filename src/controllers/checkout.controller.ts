import { Request, Response } from 'express';
import { CustomerRepository } from '../repositories';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';

export class CheckoutController {
	private cartService = new CartService();
	private orderService = new OrderService();
	private paymentService = new PaymentService();
	private customerRepository = new CustomerRepository();

	async checkout(req: Request, res: Response): Promise<void> {
		// TODO: Auth middleware
		// TODO: Move all the validation logic to the services
		// TODO: Add Transaction management
		// TODO: Add Logs
    // TODO: Refactor duplicate code
    // TODO: Refactor repositories
    // TODO: Update ErrMessage with new errors
    // TODO: Add swagger

		const { userId, addressId, paymentMethodId } = req.validated?.body;

		const customer = await this.customerRepository.getCustomerByUserId(userId);

		if (!customer) {
			throw new ApplicationError('Customer Not Found', StatusCodes.NOT_FOUND);
		}

		// validate addressId belongs to customer
		const address = await this.customerRepository.validateCustomerAddress(customer.customerId, addressId);

		if (!address) {
			throw new ApplicationError(
				'Delivery address not found or does not belong to this customer',
				StatusCodes.NOT_FOUND
			);
		}

		const cart = await this.cartService.getActiveCartWithItems(customer.customerId);

		if (!cart) {
			throw new ApplicationError('No Active cart found', StatusCodes.NOT_FOUND);
		}

		if (!cart.items || cart.items.length === 0) {
			throw new ApplicationError('Cart is empty', StatusCodes.BAD_REQUEST);
		}

		const validationResult = await this.cartService.validateCartItems(cart);
		if (!validationResult.valid) {
			throw new ApplicationError(
				`Cart validation failed: ${validationResult.errors.join(', ')}`,
				StatusCodes.BAD_REQUEST
			);
		}

		const order = await this.orderService.createOrderFromCart(cart, address, req.validated?.body);

		await this.orderService.createOrderItems(order, cart);

		const paymentResult = await this.paymentService.processPayment(order, paymentMethodId);

		if (!paymentResult.success) {
			await this.orderService.updateOrderStatus(order.orderId, 'PAYMENT_FAILED');

			throw new ApplicationError(`Payment failed: ${paymentResult.message}`, StatusCodes.BAD_REQUEST);
		}

		await this.orderService.updateOrderStatus(order.orderId, 'PAID');

		await this.cartService.deactivateCart(cart.cartId);

		const orderDetails = await this.orderService.getOrderDetails(order.orderId);

		sendResponse(res, StatusCodes.OK, 'Order placed successfully', orderDetails);
	}
}
