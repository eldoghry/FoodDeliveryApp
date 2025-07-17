import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AbstractEntity } from '../base.entity';

@Entity('settings')
@Index(['key'], { unique: true })
export class Setting extends AbstractEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 255, nullable: false, unique: true })
	key!: string;

	@Column({ type: 'jsonb', nullable: false })
	value!: any;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
