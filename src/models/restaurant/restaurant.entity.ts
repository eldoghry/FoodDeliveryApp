import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToMany,
	JoinTable,
	ManyToMany,
	ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { AbstractEntity } from '../base.entity';
import { Menu } from '../menu/menu.entity';
import { Order } from '../order/order.entity';
import { Rating } from '../rating/rating.entity';
import { Cuisine } from './cuisine.entity';
import { Chain } from './chain.entity';

export enum RestaurantStatus {
	open = 'open',
	busy = 'busy',
	pause = 'pause',
	closed = 'closed'
}

export enum RestaurantApprovalStatus {
	pending = 'pending_approval',
	approved = 'approved',
	rejected = 'rejected'
}

export enum RestaurantDeactivatedBy {
	restaurant = 'restaurant',
	system = 'system'
}

export type RestaurantRelations = 'chain' | 'user' | 'menus' | 'cartItems' | 'orders' | 'ratings' | 'cuisines' | 'menus.menuCategories' | 'menus.menuCategories.category.items' | 'users.restaurants';
@Entity()
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	name!: string;

	@Column({ type: 'integer', nullable: true })
	chainId?: number;

	@Column({ type: 'varchar', length: 512, default: '' })
	logoUrl?: string;

	@Column({ type: 'varchar', length: 512, default: '' })
	bannerUrl?: string;

	@Column({ type: 'jsonb', nullable: false })
	location!: {
		city: string;
		area: string;
		street: string;
		coordinates: {
			lat: number;
			lng: number;
		};
	};

	@Column({ type: 'enum', enum: RestaurantApprovalStatus, nullable: false })
	approvalStatus?: RestaurantApprovalStatus;

	@Column({ type: 'enum', enum: RestaurantStatus,default: RestaurantStatus.closed, nullable: false })
	status?: RestaurantStatus;

	@Column({ type: 'varchar', length: 100, nullable: true })
	email?: string;

	@Column({ type: 'varchar', length: 30, nullable: true })
	phone?: string;

	@Column({ type: 'boolean', default: false, nullable: false })
	isActive!: boolean;

	@Column({ type: 'jsonb', nullable: true })
	deactivationInfo?: {
		deactivatedAt: Date;
		reason?: string;
		deactivatedBy?: RestaurantDeactivatedBy;
	};

	@Column({ type: 'jsonb', nullable: true })
	activationInfo?: {
		activatedAt: Date;
		activatedBy?: RestaurantDeactivatedBy;
	};

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ type: 'timestamp', nullable: true })
	approvedAt?: Date;

	@Column({ type: 'timestamp', nullable: true })
	rejectedAt?: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Chain, (chain) => chain.restaurants)
	@JoinColumn({ name: 'chain_id' })
	chain?: Chain;

	@ManyToMany(() => User, (user) => user.restaurants)
	@JoinTable({
		name: 'restaurant_user',
		joinColumn: { name: 'restaurant_id', referencedColumnName: 'restaurantId' },
		inverseJoinColumn: { name: 'user_id', referencedColumnName: 'userId' }
	})
	users!: User[];


	@OneToMany(() => Menu, (menu) => menu.restaurant)
	menus!: Menu[];

	@OneToMany(() => CartItem, (cartItem) => cartItem.restaurant)
	cartItems!: CartItem[];

	@OneToMany(() => Order, (orderOrder) => orderOrder.restaurant)
	orders!: Order[];

	@OneToMany(() => Rating, (rating) => rating.restaurant)
	ratings!: Rating[];

	@ManyToMany(() => Cuisine, (cuisine) => cuisine.restaurants)
	@JoinTable({
		name: 'restaurant_cuisine',
		joinColumn: { name: 'restaurant_id', referencedColumnName: 'restaurantId' },
		inverseJoinColumn: { name: 'cuisine_id', referencedColumnName: 'cuisineId' }
	})
	cuisines!: Cuisine[];
}
