import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Customer } from './customer.entity';
import { Order } from '../order/order.entity';
import { Point } from 'geojson';

@Entity()
export class Address extends AbstractEntity {
	@PrimaryGeneratedColumn()
	addressId!: number;

	@Column({ nullable: false })
	customerId!: number;

	@Column({ type: 'varchar', length: 50, nullable: true })
	label?: string;

	@Column({ type: 'varchar', length: 255, nullable: false })
	city!: string;

	@Column({ type: 'varchar', length: 255, nullable: false })
	area!: string;

	@Column({ type: 'text', nullable: false })
	street!: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	building?: string

	@Column({ type: 'varchar', length: 50, nullable: true })
	floor?: string

	@Column({
		type: 'geography',
		spatialFeatureType: 'Point',
		srid: 4326,
	})
	geoLocation!: Point // { type: 'Point', coordinates: [longitude, latitude] }

	@Column({ type: 'boolean', default: true, nullable: false })
	isDefault!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@ManyToOne(() => Customer, (customer) => customer.addresses)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	// @OneToMany(() => Order, (order) => order.deliveryAddress)
	// orders!: Order[];
}
