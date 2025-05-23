import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { AbstractEntity } from '../base.entity';

export enum OrderStatusEnum {
	initiated = 'initiated', // order initiated and waiting for payment
	pending = 'pending', // order placed and successfully paid and waiting restaurant confirmation
	confirmed = 'confirmed', // restaurant accept order
	onTheWay = 'onTheWay', // restaurant is finished and order is ready to pickup
	delivered = 'delivered', //[terminal state] order delivered to customer
	canceled = 'canceled', // [terminal state] order canceled by customer or restaurant
	failed = 'failed' //[terminal state] order failed for any reason like payment failed
}

@Entity()
export class OrderStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderStatusId!: number;

	@Column({ type: 'varchar', length: 100 })
	status!: string; //todo: convert it to enum

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Order, (order) => order.orderStatus)
	orders!: Order[];
}
