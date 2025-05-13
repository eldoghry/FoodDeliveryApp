import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { Customer } from '../customer/customer.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class Cart extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cartId!: number;

	@Column()
	customerId!: number;

	@ManyToOne(() => Customer)
	@JoinColumn()
	customer!: Customer;

	@Column()
	restaurantId!: number;

	@ManyToOne(() => Restaurant)
	@JoinColumn()
	restaurant!: Restaurant;

	@Column({ default: 0 })
	totalItems!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
