import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { MenuCategory } from './menu-category.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class Menu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuId!: number;

	@Column()
	restaurantId!: number;

	@Column({ type: 'varchar', length: 100, unique: true })
	menuTitle!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@OneToMany(() => MenuCategory, (menuCategory) => menuCategory.menu)
	menuCategories!: MenuCategory[];
}
