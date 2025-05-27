import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Menu } from './menu.entity';
import { Category } from './category.entity';

@Entity()
@Unique(['menuId', 'categoryId'])
export class MenuCategory extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuCategoryId!: number;

	@Column({nullable: false})
	menuId!: number;

	@Column({nullable: false})
	categoryId!: number;

	@ManyToOne(() => Menu, (menu) => menu.menuCategories)
	@JoinColumn({ name: 'menu_id' })
	menu!: Menu;

	@ManyToOne(() => Category, (category) => category.menuCategories)
	@JoinColumn({ name: 'category_id' })
	category!: Category;			
}
