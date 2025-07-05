import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	JoinColumn,
	OneToOne
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Category } from './category.entity';

@Entity()
export class Menu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuId!: number;

	@Column()
	restaurantId!: number;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToOne(() => Restaurant, (restaurant) => restaurant.menu)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@OneToMany(() => Category, (category) => category.menu)
	categories!: Category[];
}
