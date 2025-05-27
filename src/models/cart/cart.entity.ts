import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	OneToOne
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { CartItem } from './cart-item.entity';

export type CartRelations = 'customer' | 'cartItems';

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
}
