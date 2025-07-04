import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToMany,
	JoinTable,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Item } from './item.entity';
import { Menu } from './menu.entity';

@Entity()
export class Category extends AbstractEntity {
	@PrimaryGeneratedColumn()
	categoryId!: number;

	@Column()
	menuId!: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	title!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => Menu, (menu) => menu.categories)
	@JoinColumn({ name: 'menu_id'})
	menu!: Menu;

	@ManyToMany(() => Item, (item) => item.categories)
	@JoinTable({
		name: 'category_items',
		joinColumn: { name: 'category_id', referencedColumnName: 'categoryId' },
		inverseJoinColumn: { name: 'item_id', referencedColumnName: 'itemId' }
	})
	items!: Item[];
}
