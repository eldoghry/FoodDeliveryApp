import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Order } from './order.entity';
import { Item } from '../menu/item.entity';


@Check(`"price" >= 0.00`)
@Check(`"total_price" >= 0.00`)
@Check(`"quantity" > 0`)
@Entity()
export class OrderItem extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderItemId!: number;

	@Column({ nullable: false })
	orderId!: number;

	@ManyToOne(() => Order, (order) => order.orderItems)
	@JoinColumn({ name: 'order_id' })
	order!: Order;

	@Column({ nullable: false })
	itemId!: number;

	@ManyToOne(() => Item, (item) => item.ordersItem)
	@JoinColumn({ name: 'item_id' })
	item!: Item;

	@Column({ type: 'integer', nullable: false })
	quantity!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;

	/**
	 * builder method to create a OrderItem instance with calculated values
	 *
	 * @param orderId - ID of the order
	 * @param itemId - Item ID
	 * @param quantity - Quantity of the item
	 * @returns A new OrderItem instance
	 */
	static buildOrderItem(dto: { orderId: number; itemId: number; quantity: number; price: number; }) {
		const orderItem = new OrderItem();
		orderItem.orderId = dto.orderId;
		orderItem.itemId = dto.itemId;
		orderItem.price = dto.price;
		orderItem.quantity = dto.quantity;

		orderItem.calculateTotalPrice();

		return orderItem;
	}

	/**
	 * calculates the total price based on current quantity, price
	 */
	calculateTotalPrice() {
		this.totalPrice = Number((this.quantity * this.price).toFixed(2));
		return this.totalPrice;
	}

}
