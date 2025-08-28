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
	OneToOne,
	Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { AbstractEntity } from '../base.entity';
import { Menu } from '../menu/menu.entity';
import { Order } from '../order/order.entity';
import { Rating } from '../rating/rating.entity';
import { Cuisine } from './cuisine.entity';
import { Chain } from './chain.entity';
import { Point } from 'geojson';
import { Item } from '../menu/item.entity';

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

export type RestaurantRelations = 'chain' | 'user' | 'menu' | 'cartItems' | 'orders' | 'ratings' | 'cuisines' | 'menu.categories' | 'menu.categories.items' | 'users.restaurants';
@Entity()
@Index('idx_restaurant_name',['name'])
@Index('idx_restaurant_active_status',['isActive','status'])
@Index('idx_restaurant_avg_rating',['averageRating'])
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	name!: string;

	@Column({ type: 'integer', nullable: false })
	chainId!: number;

	@Column({ type: 'varchar', length: 512, default: '' })
	logoUrl?: string | null;

	@Column({ type: 'varchar', length: 512, default: '' })
	bannerUrl?: string | null;

	@Column({ type: 'jsonb', nullable: false })
	location!: {
		city: string;
		area: string;
		street: string;
	};

	@Column({
		type: 'geography',
		spatialFeatureType: 'Point',
		srid: 4326,
	})
	geoLocation!: Point; // { type: 'Point', coordinates: [longitude, latitude] }

	@Column({ type: 'integer', nullable: false, default: 5000 }) // 5,000 meters = 5km
	maxDeliveryDistance!: number; 

	@Column({ type: 'enum', enum: RestaurantApprovalStatus, nullable: false })
	approvalStatus!: RestaurantApprovalStatus;

	@Column({ type: 'enum', enum: RestaurantStatus, default: RestaurantStatus.closed, nullable: false })
	status!: RestaurantStatus;

	@Column({ type: 'varchar', length: 100, nullable: true })
	email?: string | null;

	@Column({ type: 'varchar', length: 30, nullable: true })
	phone?: string | null;

	@Column({ type: 'boolean', default: false, nullable: false })
	isActive!: boolean;

	@Column({ type: 'jsonb', nullable: true })
	deactivationInfo?: {
		deactivatedAt: Date;
		reason?: string;
		deactivatedBy?: RestaurantDeactivatedBy;
	} | null;

	@Column({ type: 'jsonb', nullable: true })
	activationInfo?: {
		activatedAt: Date;
		activatedBy?: RestaurantDeactivatedBy;
	} | null;

	@Column({ type: 'decimal', default: 0, nullable: false })
	totalRating!: number;

	@Column({ type: 'integer', default: 0, nullable: false })
	ratingCount!: number;

	@Column({ type: 'decimal', default: 0, nullable: false })
	averageRating!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ type: 'timestamp', nullable: true })
	approvedAt?: Date | null;

	@Column({ type: 'timestamp', nullable: true })
	rejectedAt?: Date | null;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Chain, (chain) => chain.restaurants)
	@JoinColumn({ name: 'chain_id' })
	chain!: Chain;

	@ManyToMany(() => User, (user) => user.restaurant)
	@JoinTable({
		name: 'restaurant_user',
		joinColumn: { name: 'restaurant_id', referencedColumnName: 'restaurantId' },
		inverseJoinColumn: { name: 'user_id', referencedColumnName: 'userId' }
	})
	users!: User[];

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

	@OneToOne(() => Menu, (menu) => menu.restaurant)
	menu!: Menu;

	@OneToMany(() => Item, (item) => item.restaurant)
	items!: Item[];
}
