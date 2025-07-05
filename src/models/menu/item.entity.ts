import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Check,
	ManyToMany,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { CartItem } from '../cart/cart-item.entity';
import { OrderItem } from '../order/order-item.entity';
import { Category } from './category.entity';
import { Menu } from './menu.entity';

@Check(`"price" >= 0.00`)
@Check(`"energy_val_cal" >= 0.00`)
@Entity()
export class Item extends AbstractEntity {
	@PrimaryGeneratedColumn()
	itemId!: number;

	@Column({ type: 'varchar', length: 512, default: '' })
	imagePath!: string;

	@Column({ type: 'varchar', length: 100, nullable: false, unique: true })
	name!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0, nullable: false })
	energyValCal!: number;

	@Column({ type: 'text', default: '' })
	notes!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isAvailable!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToMany(() => Category, (category) => category.items)
	categories!: Category[];

	@OneToMany(() => CartItem, (cartItem) => cartItem.item)
	cartItems!: CartItem[];

	@OneToMany(() => OrderItem, (orderItem) => orderItem.item)
	ordersItem!: OrderItem[];
}
