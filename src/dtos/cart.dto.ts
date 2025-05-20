export class CartAddItemDto {
	customerId!: number;
	restaurantId!: number;
	itemId!: number;
	quantity!: number;
}

export class FindCartItemFilter {
	cartId?: number;
	itemId?: number;
	cartItemId?: number;
}
