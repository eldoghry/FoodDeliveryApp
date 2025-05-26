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
	itemPrice!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	totalPrice!: number;

	@CreateDateColumn()
	createdAt!: Date;
}
