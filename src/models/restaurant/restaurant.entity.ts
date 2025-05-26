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


enum Status {
	open = 'open',
	busy = 'busy',
	pause = 'pause',
	closed = 'closed'
}

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

	@Column({ type: 'enum', enum: Status, nullable: false })
	status!: Status;

	@Column({ type: 'varchar', length: 20, unique: true, nullable: false })
	commercialRegistrationNumber!: string;

	@Column({ type: 'varchar', length: 15, unique: true, nullable: false })
	vatNumber!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

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
}
