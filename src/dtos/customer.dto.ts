import { Gender } from '../models';

export class CreateCustomerDto {
	userId!: number;
	birthDate!: Date;
	gender!: Gender;
}
