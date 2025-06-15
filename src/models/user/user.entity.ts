import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	OneToOne
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { UserType } from './user-type.entity';
import { UserRole } from './user-role.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Customer } from '../customer/customer.entity';
import { Auditing } from '../auditing/auditing.entity';

@Entity({ name: 'user' })
export class User extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userId!: number;

	@Column({ type: 'varchar', length: 100 })
	name!: string;

	@Column({ type: 'varchar', length: 100, unique: true })
	email!: string;

	@Column({ type: 'varchar', length: 30, nullable: true, unique: true })
	phone!: string;

	@Column({ type: 'varchar', length: 250, select: false })
	password!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@Column({ nullable: false })
	userTypeId!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => UserType, (userType) => userType.users)
	@JoinColumn({ name: 'user_type_id' })
	userType!: UserType;

	@OneToMany(() => UserRole, (userRole) => userRole.user)
	userRoles!: UserRole[];

	@OneToOne(() => Restaurant, (restaurant) => restaurant.user)
	restaurant!: Restaurant;

	@OneToOne(() => Customer, (customer) => customer.user)
	customer!: Customer;

	@OneToMany(() => Auditing, (auditing) => auditing.user)
	audits!: Auditing[];
}
