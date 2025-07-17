export class AuthLoginDto {
	email!: string;
	password!: string;
}

export class RegisterUserDto {
	name!: string;
	email!: string;
	password!: string;
	phone!: string;
}

export class RegisterCustomerDto extends RegisterUserDto {
	birthDate!: Date;
	gender!: 'male' | 'female';
}
