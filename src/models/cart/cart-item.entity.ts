import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Cart } from './cart.entity';
import { Item } from '../menu/item.entity';

@Entity()
@Unique(['cartId', 'itemId'])
export class CartItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartItemId!: number;

	@Column()
	cartId!: number;

	@Column()
	itemId!: number;

	@Column()
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Cart, (cart) => cart.items)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@ManyToOne(() => Item, (item) => item.cartItems)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	/**
	 * builder method to create a CartItem instance with calculated values
	 *
	 * @param cartId - ID of the cart
	 * @param itemId - Item ID
	 * @param quantity - Quantity of the menu item
	 * @returns A new CartItem instance
	 */
	buildCartItem(dto: { cartId: number; itemId: number; quantity: number; price: number; discount?: number }) {
		this.cartId = dto.cartId;
		this.price = dto.price;
		this.quantity = dto.quantity;
		this.totalPrice = this.price * this.quantity;
		this.itemId = dto.itemId;

		this.calculateTotalPrice();

		return this;
	}

	/**
	 * Recalculates the total price based on current quantity, price, and discount
	 */
	calculateTotalPrice() {
		this.totalPrice = Number((this.quantity * this.price).toFixed(2));
		return this.totalPrice;
	}

	/**
	 * Updates the quantity of the cart item and recalculates the total price
	 *
	 * @param quantity - New quantity
	 * @returns The updated CartItem instance
	 */
	updateQuantity(quantity: number): CartItem {
		this.quantity = quantity;
		this.calculateTotalPrice();
		return this;
	}
}
