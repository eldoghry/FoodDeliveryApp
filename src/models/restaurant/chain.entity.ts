import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { Restaurant } from './restaurant.entity';


export type ChainRelations = 'restaurants'
@Entity()
export class Chain extends AbstractEntity {
    @PrimaryGeneratedColumn()
    chainId!: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    name!: string;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
    commercialRegistrationNumber!: string;

    @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
    vatNumber!: string;

    @Column({ type: 'integer', default: 1, nullable: true })
    storeCount?: number;
    
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Restaurant, (restaurant) => restaurant.chain)
    restaurants!: Restaurant[];
}
