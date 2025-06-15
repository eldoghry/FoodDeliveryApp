export class CreateTransactionDetailDto {
	transactionId!: number;
	provider!: string;
	action!: string;
	requestPayload?: Record<string, any>;
	responsePayload?: Record<string, any>;
	success!: boolean;
	errorStack?: Record<string, any>;
}
