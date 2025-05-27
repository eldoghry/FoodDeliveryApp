export interface PaymentResult {
	success: boolean;
	paymentId: string; // provider payment reference
	redirectUrl?: string; // For gateways like Stripe/PayPal
	error?: any;
}

export interface IPaymentStrategy {
	processPayment(amount: number, metadata?: Record<string, any>): Promise<PaymentResult>;
	verifyPayment?(...data: any): Promise<any>;
}
