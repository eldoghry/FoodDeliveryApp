import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';
import { User } from '../user/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { AbstractEntity } from '../base.entity';
import { Menu } from '../menu/menu.entity';
import { Order } from '../order/order.entity';
import { Rating } from '../rating/rating.entity';

export enum RestaurantStatus {
	open = 'open',
	busy = 'busy',
	pause = 'pause',
	closed = 'closed'
}

export type RestaurantRelations = 'user' | 'menus' | 'cartItems' | 'orders' | 'ratings';
@Entity()
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ unique: true, nullable: false })
	userId!: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	name!: string;

	@Column({ type: 'varchar', length: 512, default: '' })
	logoUrl!: string;

	@Column({ type: 'varchar', length: 512, default: '' })
	bannerUrl!: string;

	@Column({ type: 'jsonb', nullable: false })
	location!: Record<string, any>;

	@Column({ type: 'enum', enum: RestaurantStatus, nullable: false })
	status!: RestaurantStatus;

	@Column({ type: 'varchar', length: 20, unique: true, nullable: false })
	commercialRegistrationNumber!: string;

	@Column({ type: 'varchar', length: 15, unique: true, nullable: false })
	vatNumber!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@Column({ type: 'varchar', length: 100, unique: true })
	email!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@OneToMany(() => Menu, (menu) => menu.restaurant)
	menus!: Menu[];

	@OneToMany(() => CartItem, (cartItem) => cartItem.restaurant)
	cartItems!: CartItem[];

	@OneToMany(() => Order, (orderOrder) => orderOrder.restaurant)
	orders!: Order[];

	@OneToMany(() => Rating, (rating) => rating.restaurant)
	ratings!: Rating[];
}
