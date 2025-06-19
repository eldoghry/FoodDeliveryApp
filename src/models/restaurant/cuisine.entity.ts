import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';

import { Restaurant } from './restaurant.entity';

@Entity()
@Unique(['name'])
export class Cuisine extends AbstractEntity {
	@PrimaryGeneratedColumn()
	cuisineId!: number;

	@Column({ type: 'varchar', length: 255, nullable: false })
	name!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@ManyToMany(() => Restaurant, (restaurant) => restaurant.cuisines)
	restaurants!: Restaurant[];
}
