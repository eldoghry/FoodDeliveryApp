import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToMany,
	OneToOne,
	Index
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from '../order/order-item.entity';

export type CartRelations = 'cartItems';

@Index('idx_customer_id', ['customerId']) 
@Entity()
export class Cart extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@OneToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => CartItem, (cartItem) => cartItem.cart)
	cartItems!: CartItem[];

	buildCart(customerId: number) {
		this.customerId = customerId;
	}

	static calculateTotalPrice(items: CartItem[] | OrderItem[], customServiceFees?: number, customDeliveryFees?: number) {
		const finalServiceFees = Number(customServiceFees) || 0;
		const finaldeliveryFees = Number(customDeliveryFees) || 0;

		const result =
			items.reduce((total, item) => Number(total) + Number(item.totalPrice), 0) + finalServiceFees + finaldeliveryFees;
		return result;
	}

	static calculateTotalItems(items: CartItem[] | OrderItem[]) {
		const result = items.reduce((total, item) => Number(total) + Number(item.quantity), 0);
		return result;
	}
}
