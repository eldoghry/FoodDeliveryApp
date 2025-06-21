import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { User } from './user.entity';

export enum UserTypeNames {
	customer = 'customer',
	restaurant_owner = 'restaurant_owner',
	restaurant_manager = 'restaurant_manager',
	restaurant_employee = 'restaurant_employee',
	restaurant_delivery_person = 'restaurant_delivery_person',
	admin = 'admin',
}
@Entity()
export class UserType extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userTypeId!: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	name!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => User, (user) => user.userType)
	users!: User[];
}
