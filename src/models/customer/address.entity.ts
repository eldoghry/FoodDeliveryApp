import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from './customer.entity';

// Address entity
@Entity()
export class Address extends AbstractEntity {
	@PrimaryGeneratedColumn()
	addressId!: number;

	@Column({ type: 'text' })
	addressLine1!: string;

	@Column({ type: 'text' })
	addressLine2!: string;

	@Column({ type: 'varchar', length: 255 })
	city!: string;

	@Column()
	customerId!: number;

	@Column({ default: false })
	isDefault!: boolean;

	@ManyToOne(() => Customer, (customer) => customer.addresses)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
