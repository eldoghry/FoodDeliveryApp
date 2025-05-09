import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, Min, IsIn } from 'class-validator';

export class CreateUserBody {
	@IsString()
	@IsNotEmpty()
	firstName!: string;

	@IsString()
	@IsNotEmpty()
	lastName!: string;

	@IsEmail()
	email!: string;
}

export class GetUsersQuery {
	@IsOptional()
	@Transform(({ value }) => {
		return Number(value);
	})
	@IsIn([10, 20, 30, 50, 100], { message: 'Value must be either 10, 20, 30, 50, 100' })
	limit?: number = 10;

	// @IsOptional()
	@Transform(({ value }) => {
		return Number(value);
	})
	@IsInt()
	@Min(1)
	page?: number = 10;
}
