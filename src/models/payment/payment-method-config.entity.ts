import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class PaymentMethodConfig extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodConfigId!: number;

	@Column({ nullable: false })
	paymentMethodId!: number;

	@Column({ type: 'jsonb', nullable: false })
	gatewayConfig!: Record<string, any>;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => PaymentMethod)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;
}
