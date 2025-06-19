import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	OneToOne,
	Index,
	Check
} from 'typeorm';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Order } from '../order/order.entity';
import { Customer } from '../customer/customer.entity';

export type RatingRelations = 'customer' | 'restaurant' | 'order';

@Entity()
@Index(['restaurantId', 'customerId'], { unique: false }) // Composite index for faster queries
@Index(['orderId'], { unique: true })
@Check('rating >= 1 AND rating <= 5')
@Check('LENGTH(comment) >= 4') // Minimum comment length of 4 characters
export class Rating {
	@PrimaryGeneratedColumn()
	ratingId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@Column({ nullable: false })
	restaurantId!: number;

	@Column({ nullable: false })
	orderId!: number;

	@Column({ nullable: false, type: 'smallint' })
	rating!: number;

	@Column({ nullable: true, length: 500 })
	comment!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => Customer, (customer) => customer.ratings)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.ratings)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@OneToOne(() => Order, (order) => order.rating)
	@JoinColumn({ name: 'order_id' })
	order!: Order;
}
