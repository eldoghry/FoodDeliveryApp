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
import { Restaurant } from './restaurant.entity';

@Entity()
export class Branch extends AbstractEntity {
	@PrimaryGeneratedColumn()
	branchId!: number;

	@Column()
	restaurantId!: number;

	@ManyToOne(() => Restaurant)
	@JoinColumn({ name: 'restaurant_id' })
	restaurant!: Restaurant;

	@Column()
	name!: string;

	@Column({ type: 'text', default: '' })
	address!: string;

	@Column({ type: 'jsonb', nullable: true })
	location?: any;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
