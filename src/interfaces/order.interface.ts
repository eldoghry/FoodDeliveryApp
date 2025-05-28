import { Order } from '../models';

export interface PlaceOrderResponse {
	paymentReference?: string;
	success: boolean;
	error?: any;
	paymentUrl?: string;
	order: Order;
}
