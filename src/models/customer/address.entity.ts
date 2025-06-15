import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from './customer.entity';
import { Order } from '../order/order.entity';

@Entity()
export class Address extends AbstractEntity {
	@PrimaryGeneratedColumn()
	addressId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@Column({ type: 'text', nullable: false })
	addressLine1!: string;

	@Column({ type: 'text', nullable: false })
	addressLine2!: string;

	@Column({ type: 'varchar', length: 255, nullable: false  })
	city!: string;

	@Column({ type: 'boolean', default: false, nullable: false })
	isDefault!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Customer, (customer) => customer.addresses)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@OneToMany(() => Order, (order) => order.deliveryAddress)
	orders!: Order[];
}
