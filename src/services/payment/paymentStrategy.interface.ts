import { Order } from '../../models';

export interface PaymentResult {
	success: boolean;
	paymentId: string; // provider payment reference
	redirectUrl?: string; // For gateways like Stripe/PayPal
	error?: any;
}

export interface PaymentRequestMetadata {
	transactionId: number;
	transactionReference: string;
	order: Order;
	[key: string]: any;
}

export interface IPaymentStrategy {
	processPayment(amount: number, metadata?: PaymentRequestMetadata): Promise<PaymentResult>;
	verifyPayment?(...data: any): Promise<any>;
}
