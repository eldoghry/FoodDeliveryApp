import { Address, Order, PaymentMethodEnum } from '../models';

export interface PlaceOrderResponse {
	paymentReference?: string;
	success: boolean;
	error?: any;
	paymentUrl?: string;
	order: Order;
}

export interface CheckoutPayload {
	customerId: number;
	restaurantId: number;
	addressId: number;
	paymentMethod: PaymentMethodEnum;
}
