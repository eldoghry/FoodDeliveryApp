import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Auditing {
	@PrimaryGeneratedColumn()
	auditingId!: number;

	@Column({ nullable: false })
	userId!: number;

	@Column({ type: 'jsonb', default: {}, nullable: false })
	auditEvent!: Record<string, any>;

	@Column({ type: 'jsonb', default: {}, nullable: false })
	auditData!: Record<string, any>;

	@Column({ type: 'timestamp', nullable: false })
	auditDate!: Date;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User, (user) => user.audits)
	@JoinColumn({ name: 'user_id' })
	user!: User; 
}
