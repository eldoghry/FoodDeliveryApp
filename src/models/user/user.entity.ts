import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { UserType } from './user-type.entity';

@Entity()
export class User extends AbstractEntity {
	@PrimaryGeneratedColumn()
	userId!: number;

	@Column()
	name!: string;

	@Column({ unique: true })
	email!: string;

	@Column({ nullable: true, unique: true })
	phone?: string;

	@Column()
	password!: string;

	@Column({ default: true })
	isActive!: boolean;

	@Column({ nullable: true })
	userTypeId?: number;

	@ManyToOne(() => UserType)
	@JoinColumn()
	userType?: UserType;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
