import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
	Check
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Cart } from './cart.entity';
import { Item } from '../menu/item.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Check(`"quantity" > 0`)
@Check(`"price" >= 0.00`)
@Check(`"total_price" >= 0.00`)
@Entity()
@Unique(['cartId', 'itemId'])
export class CartItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartItemId!: number;

	@Column({ nullable: false })
	cartId!: number;

	@Column({ nullable: false })
	restaurantId!: number;

	@Column({ nullable: false })
	itemId!: number;

	@Column({ nullable: false })
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Cart, (cart) => cart.cartItems)
	@JoinColumn({ name: 'cart_id' })
	cart!: Cart;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.cartItems)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

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
	static buildCartItem(dto: { cartId: number; restaurantId: number; itemId: number; quantity: number; price: number }) {
		const cartItem = new CartItem();
		cartItem.cartId = dto.cartId;
		cartItem.restaurantId = dto.restaurantId;
		cartItem.itemId = dto.itemId;
		cartItem.price = dto.price;
		cartItem.quantity = dto.quantity;

		cartItem.calculateCartItemTotalPrice();

		return cartItem;
	}

	/**
	 * Recalculates the total price based on current quantity, price, and discount
	 */
	calculateCartItemTotalPrice() {
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
		this.calculateCartItemTotalPrice();
		return this;
	}
}
