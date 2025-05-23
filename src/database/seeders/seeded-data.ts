// import { AbstractEntity } from '../../abstract/base.entity';
import {
	Address,
	Customer,
	Item,
	Menu,
	MenuItem,
	PaymentMethod,
	PaymentMethodConfig,
	PaymentStatus,
	Restaurant,
	Role,
	User,
	UserRole,
	UserType
} from '../../models';
import { SeedData } from '.';
import { faker } from '@faker-js/faker';

//
const ITEMS_COUNT = 100;
const RESTAURANTS_COUNT = 100;
const MENUS_COUNT = 10;
const USERS_COUNT = 100;
const ADDRESSES_COUNT = 10;

// * Users
const userTypesData: SeedData<UserType> = {
	entity: UserType,
	data: [
		{
			name: 'customer'
		},
		{
			name: 'admin'
		},
		{
			name: 'editor'
		}
	]
};

const usersData: SeedData<User> = {
	entity: User,
	data: Array.from({ length: 100 }).map((u) => {
		return {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: 'hashpassword',
			phone: faker.phone.number(),
			isActive: faker.datatype.boolean(),
			userTypeId: 1
		};
	})
};

const roleSeedData: SeedData<Role> = {
	entity: Role,
	data: ['customer', 'admin', 'driver', 'staff', 'editor'].map((role, i) => ({
		name: role.toLowerCase()
	}))
};

const userRoleSeedData: SeedData<UserRole> = {
	entity: UserRole,
	data: Array.from({ length: 99 }).map((_, index) => ({
		userId: index + 1, // adjust range based on seeded users
		roleId: faker.number.int({ min: 1, max: 5 }) // based on roles seeded above
	}))
};

const addressSeedData: SeedData<Address> = {
	entity: Address,
	data: Array.from({ length: 10 }).map(() => ({
		userId: faker.number.int({ min: 1, max: 100 }), // assuming userId 1-100 exists
		addressLine1: faker.location.streetAddress(),
		addressLine2: faker.location.secondaryAddress(),
		city: faker.location.city()
	}))
};

const customerSeedData: SeedData<Customer> = {
	entity: Customer,
	data: Array.from({ length: 100 }).map((_, index) => ({
		userId: index + 1, // assuming userId starts from 1
		birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		gender: faker.helpers.arrayElement(['male', 'female'])
	}))
};

// * Menu

const menuSeedData: SeedData<Menu> = {
	entity: Menu,
	data: Array.from({ length: 10 }).map((_, index) => ({
		menuTitle: faker.commerce.department(),
		isActive: true,
		restaurantId: index + 1
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: ITEMS_COUNT }).map(() => ({
		imagePath: faker.image.url(),
		name: faker.food.dish(),
		description: faker.food.description(),
		price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
		energyValCal: parseFloat(faker.number.float({ min: 50, max: 500 }).toFixed(2)),
		notes: faker.lorem.sentence(),
		isAvailable: faker.datatype.boolean()
	}))
};

// * restaurants

const restaurantSeedData: SeedData<Restaurant> = {
	entity: Restaurant,
	data: Array.from({ length: RESTAURANTS_COUNT }).map((_, index) => ({
		userId: index + 1,
		name: faker.company.name(),
		logoUrl: faker.image.url(),
		bannerUrl: faker.image.url(),
		location: {
			type: 'Point',
			coordinates: [parseFloat(faker.location.longitude().toString()), parseFloat(faker.location.latitude().toString())]
		},
		status: faker.helpers.arrayElement(['open', 'busy', 'pause', 'closed']),
		commercialRegistrationNumber: faker.string.alphanumeric(10),
		vatNumber: faker.string.alphanumeric(12),
		isActive: faker.datatype.boolean()
	}))
};

const menuItemSeedData: SeedData<MenuItem> = {
	entity: MenuItem,
	data: Array.from({ length: 10 }).map((_, index) => ({
		menuId: faker.number.int({ min: 1, max: 9 }), // assuming menuId 1-10 exists
		itemId: index + 1
	}))
};

// Seed data for PaymentMethod
const paymentMethodSeedData: SeedData<PaymentMethod> = {
	entity: PaymentMethod,
	data: Array.from({ length: 4 }).map((_, i) => ({
		methodName: faker.finance.transactionType() + `_${i}`,
		description: faker.lorem.sentence(),
		iconUrl: faker.image.url({ width: 50, height: 50 }),
		order: i,
		isActive: true
	}))
};

// Seed data for PaymentStatus
const paymentStatusSeedData: SeedData<PaymentStatus> = {
	entity: PaymentStatus,
	data: [
		{ statusName: 'pending', isActive: true },
		{ statusName: 'paid', isActive: true },
		{ statusName: 'failed', isActive: true },
		{ statusName: 'refunded', isActive: true }
	]
};

const seedData = [
	// users
	userTypesData,
	roleSeedData,
	usersData,
	customerSeedData,
	addressSeedData,
	userRoleSeedData,

	// restaurant & menu
	restaurantSeedData,
	menuSeedData,
	itemSeedData,
	menuItemSeedData,

	// payment methods
	paymentMethodSeedData,
	paymentStatusSeedData
];

export default seedData;
