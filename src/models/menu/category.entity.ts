import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToMany,
	JoinTable
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { MenuCategory } from './menu-category.entity';
import { Item } from './item.entity';

@Entity()
export class Category extends AbstractEntity {
	@PrimaryGeneratedColumn()
	categoryId!: number;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	title!: string;

	@Column({ type: 'boolean', default: true, nullable: false })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => MenuCategory, (menuCategory) => menuCategory.category)
	menuCategories!: MenuCategory[];

	@ManyToMany(() => Item, (item) => item.categories)
	@JoinTable({
		name: 'category_items',
		joinColumn: { name: 'category_id', referencedColumnName: 'categoryId' },
		inverseJoinColumn: { name: 'item_id', referencedColumnName: 'itemId' }
	})
	items!: Item[];
}
