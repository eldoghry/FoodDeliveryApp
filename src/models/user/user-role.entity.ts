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
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity()
export class UserRole extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userRoleId!: number;

	@Column()
	userId!: number;

	@ManyToOne(() => User)
	@JoinColumn()
	user!: User;

	@Column()
	roleId!: number;

	@ManyToOne(() => Role)
	@JoinColumn()
	role!: Role;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
