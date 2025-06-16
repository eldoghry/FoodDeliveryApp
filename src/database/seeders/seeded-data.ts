// import { AbstractEntity } from '../../abstract/base.entity';
import {
	Address,
	Customer,
	Gender,
	Item,
	Menu,
	MenuCategory,
	MenuItem,
	Order,
	OrderStatusEnum,
	PaymentMethod,
	PaymentMethodConfig,
	PaymentMethodEnum,
	Restaurant,
	RestaurantStatus,
	Role,
	Setting,
	User,
	UserType
} from '../../models';
import { SeedData } from '.';
import { faker } from '@faker-js/faker';
import { Category } from '../../models/menu/category.entity';
import { SettingKey } from '../../enums/setting.enum';
import { PaymentMethodStatus } from '../../enums/payment_method.enum';
//
const ITEMS_COUNT = 100;
const RESTAURANTS_COUNT = 100;
const MENUS_COUNT = 10;
const USERS_COUNT = 100;
const ADDRESSES_COUNT = 10;
const ROLES = [
	'customer',
	'super_admin',
	'restaurant_admin',
	'auditor',
	'support',
	'driver',
	'restaurant_user',
	'admin'
];

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
			name: 'restaurant_user'
		}
	]
};

const usersData: SeedData<User> = {
	entity: User,
	data: Array.from({ length: 100 }).map((u, idx) => {
		const userRoles = {
			0: 'customer',
			1: 'admin',
			2: 'restaurant_user'
		} as any;

		const userName = userRoles[idx] || faker.person.fullName();
		const userEmail = userRoles[idx] ? `${userRoles[idx]}@food.com` : faker.internet.email();
		const roles = idx < 3 ? [userRoles[idx]] : [faker.helpers.arrayElement(ROLES)];

		const user = new User();
		user.name = userName;
		user.email = userEmail;
		user.password = '$argon2id$v=19$m=65536,t=5,p=1$sSiFpvLPCTVNL2sZlwdgtw$oc+CZ45sNxoclIzghPOcb6p+Wrk8KFZhhodIaJ5MeVc'; // P@$$w0rd,
		user.phone = faker.phone.number();
		user.isActive = idx < 3 ? true : faker.datatype.boolean();
		user.userTypeId = idx < 3 ? idx + 1 : 1;

		console.log(
			'User Role Index:',
			ROLES.findIndex((role) => role === userRoles[idx])
		);
		if (userRoles[idx]) user.roles = [{ roleId: 1 + ROLES.findIndex((role) => role === userRoles[idx]) }] as Role[];
		else user.roles = [{ roleId: 1 }] as Role[];

		return user;
	})
};

const roleSeedData: SeedData<Role> = {
	entity: Role,
	data: ROLES.map((role, i) => ({
		name: role.toLowerCase()
	}))
};

type UserRoles = { userId: number; roleId: number };

// const userRoleSeedData: SeedData<UserRoles> = {
// 	entity: UserRoles,
// 	data: Array.from({ length: 99 }).map((_, index) => ({
// 		userId: index + 1, // adjust range based on seeded users
// 		roleId: faker.number.int({ min: 1, max: 7 }) // based on roles seeded above
// 	}))
// };

const addressSeedData: SeedData<Address> = {
	entity: Address,
	data: Array.from({ length: 10 }).map((_, index) => ({
		customerId: index + 1, // assuming customerId 1-100 exists
		street: faker.location.streetAddress(),
		city: faker.location.city(),
		area: faker.location.continent(),
		building: faker.location.buildingNumber(),
		floor: faker.number.int({ min: 1, max: 10 }).toString(),
		coordinates: {
			lng: parseFloat(faker.location.longitude().toString()),
			lat: parseFloat(faker.location.latitude().toString())
		},
		isDefault: true,
		label: faker.lorem.word()
	}))
};

const customerSeedData: SeedData<Customer> = {
	entity: Customer,
	data: Array.from({ length: 100 }).map((_, index) => ({
		userId: index + 1, // assuming userId starts from 1
		birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		gender: faker.helpers.arrayElement(Object.values(Gender))
	}))
};

// * Menu

const menuSeedData: SeedData<Menu> = {
	entity: Menu,
	data: Array.from({ length: 10 }).map((_, index) => ({
		menuTitle: faker.food.spice() + `${index + 1}`,
		isActive: index === 0,
		restaurantId: index < 3 ? 1 : index + 1
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: ITEMS_COUNT }).map((_, index) => ({
		imagePath: faker.image.url(),
		name: faker.food.dish() + `${index + 1}`,
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
		status: index < 3 ? RestaurantStatus.open : faker.helpers.arrayElement(Object.values(RestaurantStatus)),
		commercialRegistrationNumber: faker.string.alphanumeric(10),
		vatNumber: faker.string.alphanumeric(12),
		isActive: faker.datatype.boolean(),
		email: `orders@restaurant${index + 1}.com`
	}))
};

const menuItemSeedData: SeedData<MenuItem> = {
	entity: MenuItem,
	data: Array.from({ length: 10 }).map((_, index) => ({
		menuId: index <= 3 ? 1 : faker.number.int({ min: 1, max: 9 }), // assuming menuId 1-10 exists
		itemId: index + 1
	}))
};

// Seed data for PaymentMethod
const paymentMethodSeedData: SeedData<PaymentMethod> = {
	entity: PaymentMethod,
	data: [
		{
			code: PaymentMethodEnum.CARD,
			description: 'Paypal Card',
			iconUrl: faker.image.url(),
			order: 1,
			status: PaymentMethodStatus.ACTIVE
		},
		{
			code: PaymentMethodEnum.COD,
			description: 'Cash on delivery',
			iconUrl: faker.image.url(),
			order: 2,
			status: PaymentMethodStatus.ACTIVE
		}
	]
};

// category
const categorySeedData: SeedData<Category> = {
	entity: Category,
	data: Array.from({ length: 10 }).map((_, i) => ({
		title: faker.food.ethnicCategory() + i,
		isActive: true
	}))
};

const menuCategorySeedData: SeedData<MenuCategory> = {
	entity: MenuCategory,
	data: Array.from({ length: 10 }).map((_, i) => ({
		menuId: i < 3 ? 1 : faker.number.int({ min: 1, max: 9 }),
		categoryId: i + 1
	}))
};

const settingSeedData: SeedData<Setting> = {
	entity: Setting,
	data: [
		{ key: SettingKey.SITE_NAME, value: faker.company.name(), description: 'App name shown in UI' },
		{ key: SettingKey.SITE_LOGO_URL, value: faker.image.url(), description: 'Logo image URL' },
		{ key: SettingKey.PRIMARY_COLOR, value: faker.color.rgb(), description: 'Primary brand color' },

		{ key: SettingKey.DEFAULT_LANGUAGE, value: 'en', description: 'Default language code' },
		{ key: SettingKey.SUPPORTED_LANGUAGES, value: ['en', 'ar', 'fr'], description: 'Languages supported in the app' },
		{ key: SettingKey.DEFAULT_CURRENCY, value: 'USD', description: 'Default currency used for transactions' },
		{
			key: SettingKey.LOCALE_FORMAT_OPTIONS,
			value: { date: 'DD/MM/YYYY', time: 'HH:mm' },
			description: 'Format for date and time display'
		},

		{ key: SettingKey.MAINTENANCE_MODE, value: false, description: 'Is the site in maintenance mode?' },
		{
			key: SettingKey.MAINTENANCE_MESSAGE,
			value: 'Scheduled maintenance from 2 AM to 4 AM UTC.',
			description: 'Maintenance mode message'
		},

		{ key: SettingKey.MIN_ORDER_AMOUNT, value: 5, description: 'Minimum amount required to place an order' },
		{ key: SettingKey.MAX_ORDER_ITEMS, value: 50, description: 'Maximum number of items per order' },
		{ key: SettingKey.ORDER_CANCELLATION_WINDOW_MIN, value: 10, description: 'Minutes allowed to cancel an order' },
		{ key: SettingKey.ORDER_EXPIRED_AFTER_WINDOW_MIN, value: 120, description: 'Expire an order after minute' },
		{ key: SettingKey.ORDER_RATING_WINDOW_MIN, value: 7 * 24 * 60, description: 'Minutes allowed to rate an order' },

		{ key: SettingKey.DELIVERY_BASE_FEE, value: 30, description: 'Base fee for delivery orders' },
		{ key: SettingKey.DELIVERY_PER_KM_FEE, value: 2.5, description: 'Delivery fee per kilometer' },
		{ key: SettingKey.DELIVERY_RADIUS_KM, value: 30, description: 'Max delivery radius in kilometers' },
		{
			key: SettingKey.DEFAULT_PREPARATION_TIME_MIN,
			value: 20,
			description: 'Default food preparation time in minutes'
		},

		{ key: SettingKey.SERVICE_BASE_FEE, value: 25, description: 'Service fee percentage added to orders' },
		{ key: SettingKey.TAX_RATE_PERCENT, value: 0.14, description: 'Tax rate applied to orders' },
		{ key: SettingKey.ENABLE_CASH_ON_DELIVERY, value: true, description: 'Is cash on delivery allowed?' },

		{ key: SettingKey.PUSH_NOTIFICATIONS_ENABLED, value: true, description: 'Are push notifications enabled?' },
		{
			key: SettingKey.ORDER_STATUS_TEMPLATES,
			value: {
				placed: 'Your order has been placed!',
				on_route: 'Your food is on the way!',
				delivered: 'Enjoy your meal!'
			},
			description: 'Notification messages for order statuses'
		},

		{ key: SettingKey.SUPPORT_EMAIL, value: faker.internet.email(), description: 'Customer support email' },
		{
			key: SettingKey.SUPPORT_PHONE,
			value: faker.phone.number(),
			description: 'Customer support phone number'
		},
		{
			key: SettingKey.BUSINESS_HOURS,
			value: {
				mon_fri: '09:00-18:00',
				sat: '10:00-14:00',
				sun: 'Closed'
			},
			description: 'Working hours for support or operations'
		},

		{ key: SettingKey.PASSWORD_MIN_LENGTH, value: 8, description: 'Minimum password length for users' },
		{ key: SettingKey.JWT_EXPIRATION_MIN, value: 60, description: 'JWT token expiry duration in minutes' },
		{ key: SettingKey.RATE_LIMIT_PER_MIN, value: 100, description: 'API rate limit per minute per user' },

		{
			key: SettingKey.MAPS_API_CONFIG,
			value: {
				provider: 'google',
				key: faker.string.alphanumeric(32)
			},
			description: 'Google Maps API configuration'
		},
		{
			key: SettingKey.FIREBASE_CONFIG,
			value: {
				projectId: faker.string.uuid()
			},
			description: 'Firebase project configuration'
		}
	]
};

const orderSeedData: SeedData<Order> = {
	entity: Order,
	data: Array.from({ length: 10 }, (_, index) => {
		const orderStatus = index === 0 ? OrderStatusEnum.delivered : faker.helpers.enumValue(OrderStatusEnum);
		const placedAt = orderStatus === OrderStatusEnum.delivered ? faker.date.past() : undefined;
		const deliveredAt = placedAt ? new Date(new Date(placedAt).getTime() + 360000) : undefined;
		return {
			orderId: index + 1,
			customerId: 1,
			restaurantId: 1,
			deliveryAddressId: 1,
			deliveryFees: 20,
			serviceFees: 30,
			deliveredAt,
			placedAt,
			customerInstructions: faker.lorem.sentence(),
			status: orderStatus,
			totalAmount: 50 + index * 10,
			createdAt: new Date(),
			updatedAt: new Date()
		};
	})
};

const seedData = [
	// users
	userTypesData,
	roleSeedData,
	usersData,
	customerSeedData,
	addressSeedData,

	// restaurant & menu
	restaurantSeedData,
	menuSeedData,
	itemSeedData,
	menuItemSeedData,

	// payment methods
	paymentMethodSeedData,

	// category
	categorySeedData,
	menuCategorySeedData,

	// settings
	settingSeedData,

	// order
	orderSeedData
];

export default seedData;
