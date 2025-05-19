export interface ItemInCartDTO {
    cartId: number;
    cartItemId: number;
    id: number;
    name: string;
    imagePath: string;
    quantity: number;
    totalPriceBefore: string;
    discount: string;
    totalPriceAfter: string;
    isAvailable?: boolean;
}


export interface CartResponseDTO {
    id: number;
    customerId: number;
    restaurant: {
        id: number;
        name: string;
    };
    items: ItemInCartDTO[];
    totalItems: number;
    totalPrice: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

