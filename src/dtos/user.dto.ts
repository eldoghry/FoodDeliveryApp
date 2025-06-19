import { UserRelations } from '../models';

export class GetOneUserByDto {
	userId?: number;
	email?: string;
	withPassword?: boolean;
	isActive?: boolean;
	relations?: UserRelations[];
}

export class CreateUserDto {
	name!: string;
	email!: string;
	password!: string;
	phone?: string;
	userTypeId!: number;
}
