import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	OneToOne,
	ManyToMany,
	JoinTable,
	DeleteDateColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { UserType } from './user-type.entity';
// import { UserRole } from './user-role.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Customer } from '../customer/customer.entity';
import { Auditing } from '../auditing/auditing.entity';
import { Role } from './role.entity';

export type UserRelations = 'userType' | 'roles' | 'restaurant' | 'customer' | 'audits';

export enum DeactivatedBy {
	customer = 'customer',
	system = 'system'
}
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

	@Column({ type: 'jsonb', nullable: true })
    deactivationInfo?: {
        deactivatedAt: Date;
        reason?: string;
        deactivatedBy?: DeactivatedBy;
    };

	@ManyToOne(() => UserType, (userType) => userType.users)
	@JoinColumn({ name: 'user_type_id' })
	userType!: UserType;

	// @OneToMany(() => UserRole, (userRole) => userRole.user)
	// userRoles!: UserRole[];

	@ManyToMany(() => Role)
	@JoinTable({
		name: 'user_roles',
		joinColumn: { name: 'user_id', referencedColumnName: 'userId' },
		inverseJoinColumn: { name: 'role_id', referencedColumnName: 'roleId' }
	})
	roles!: Role[];

	@OneToOne(() => Restaurant, (restaurant) => restaurant.user)
	restaurant!: Restaurant;

	@OneToOne(() => Customer, (customer) => customer.user)
	customer!: Customer;

	@OneToMany(() => Auditing, (auditing) => auditing.user)
	audits!: Auditing[];
}
