export class AuthLoginDto {
	email!: string;
	password!: string;
}

class RegisterUserDto {
	name!: string;
	email!: string;
	password!: string;
	phone!: string;
}

export class RegisterCustomerDto extends RegisterUserDto {
	birthDate!: Date;
	gender!: 'male' | 'female';
}

// export class RegisterOwnerDto {
// 	name!: string;
// 	email!: string;
// 	password!: string;
// 	phone!: string;
// }
