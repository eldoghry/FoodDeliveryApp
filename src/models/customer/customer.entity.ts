import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
	OneToMany,
	Check,
	DeleteDateColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { User } from '../user/user.entity';
import { Address } from './address.entity';
import { Order } from '../order/order.entity';
import { Rating } from '../rating/rating.entity';

export enum Gender {
	male = 'male',
	female = 'female'
}

export type CustomerRelations = 'addresses' | 'user' | 'orders';

@Check(`"birth_date" <= CURRENT_DATE`)
@Entity()
export class Customer extends AbstractEntity {
	@PrimaryGeneratedColumn()
	customerId!: number;

	@Column({ unique: true, nullable: false })
	userId!: number;

	@Column({ type: 'date', nullable: true })
	birthDate!: Date;

	@Column({ type: 'enum', enum: Gender, nullable: true })
	gender!: Gender;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@OneToMany(() => Address, (address) => address.customer)
	addresses!: Address[];

	@OneToMany(() => Order, (order) => order.customer)
	orders!: Order[];

	@OneToMany(() => Rating, (rating) => rating.customer)
	ratings!: Rating[];
}
