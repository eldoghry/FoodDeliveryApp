import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';

@Entity()
export class Role extends AbstractEntity {
	@PrimaryGeneratedColumn()
	roleId!: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
