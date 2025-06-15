import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AbstractEntity } from '../base.entity';

@Entity('settings')
@Index(['key'], { unique: true })
export class Setting extends AbstractEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	key!: string;

	@Column({ type: 'jsonb', nullable: true })
	value!: any;

	@Column({ nullable: true })
	description?: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
