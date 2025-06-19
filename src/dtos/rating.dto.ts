export class CreateRatingDto {
	customerId!: number;
	orderId!: number;
	rating!: number;
	comment?: string;
}
