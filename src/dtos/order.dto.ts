import { OrderStatusChangeBy, OrderStatusEnum, PaymentMethodEnum, Address } from '../models';

export class CancellationInfo {
    cancelledBy!: OrderStatusChangeBy;
    reason!: string;
    cancelledAt!: Date;
}
export class OrderData {
    orderId!: number;
    status!: OrderStatusEnum;
    customer?: { customerId: number; name: string; phone: string; };
    restaurant?: { restaurantId: number; name: string; };
    placedAt?: Date;
    deliveredAt?: Date;
    cancellationInfo?: CancellationInfo;
    items!: OrderItemResult[];
    deliveryAddress?: Address;
    deliveryFees!: number;
    serviceFees!: number;
    totalAmount!: number;
    customerInstructions!: string;
    paymentMethod!: PaymentMethodEnum;
    createdAt!: Date;
    updatedAt!: Date;
}

export class OrderHistoryResult {
    orders!: OrderData[];
    nextCursor!: string | null;
    hasNextPage!: boolean;
}

export class OrderItemResult {
    orderId!: number;
    itemId!: number;
    imagePath!: string;
    name!: string;
    quantity!: number;
    price!: number;
    totalPrice!: number;
}