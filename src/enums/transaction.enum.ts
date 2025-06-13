export enum TransactionPaymentStatus {
	INITIATED = 'INITIATED', // User started payment process
	PENDING = 'PENDING', // Waiting for provider response
	SUCCESS = 'SUCCESS', // Paid successfully
	FAILED = 'FAILED', // Payment failed
	CANCELLED = 'CANCELLED', // Cancelled by user or system
	REFUNDED = 'REFUNDED', // Full refund completed
	PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
	EXPIRED = 'EXPIRED' // Session or payment expired
}
