// import { AbstractEntity } from '../../abstract/base.entity';
import {
	Address,
	Customer,
	Gender,
	Item,
	Menu,
	Order,
	OrderStatusEnum,
	PaymentMethod,
	PaymentMethodEnum,
	Restaurant,
	RestaurantApprovalStatus,
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
import { Rating } from '../../models/rating/rating.entity';
import { Cuisine } from '../../models/restaurant/cuisine.entity';
import { DataSource } from 'typeorm';
import { Chain } from '../../models/restaurant/chain.entity';
//
const ITEMS_COUNT = 100;
const RESTAURANTS_COUNT = 100;
const ORDERS_COUNT = 200;
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

const CUISINES = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese'];

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
		geoLocation: {
			type: 'Point',
			coordinates: [parseFloat(faker.location.longitude().toString()), parseFloat(faker.location.latitude().toString())]
		},
		isDefault: false,
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
		isActive: true,
		restaurantId: index + 1
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: ITEMS_COUNT }).map((_, index) => ({
		restaurantId: index + 1,
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
const cuisineSeededData: SeedData<Cuisine> = {
	entity: Cuisine,
	data: CUISINES.map((name, index) => ({
		cuisineId: index + 1,
		name,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	}))
};

const chainSeedData: SeedData<Chain> = {
	entity: Chain,
	data: Array.from({ length: 10 }).map((_, index) => ({
		chainId: index + 1,
		name: faker.company.name(),
		commercialRegistrationNumber: faker.string.alphanumeric(10),
		vatNumber: faker.string.alphanumeric(12),
		createdAt: new Date(),
		updatedAt: new Date()
	}))
};

const restaurantSeedData: SeedData<Restaurant> = {
	entity: Restaurant,
	data: Array.from({ length: RESTAURANTS_COUNT }).map((_, index) => {
		return {
			chainId: 1,
			name: faker.company.name(),
			logoUrl: faker.image.url(),
			bannerUrl: faker.image.url(),
			location: {
				city: faker.location.city(),
				area: faker.location.continent(),
				street: faker.location.streetAddress(),
			},
			geoLocation: { type: 'Point', coordinates: [parseFloat(faker.location.longitude().toString()), parseFloat(faker.location.latitude().toString())] },
			maxDeliveryDistance: faker.number.int({ min: 500, max: 5000 }),
			status: RestaurantStatus.open,
			approvalStatus: RestaurantApprovalStatus.pending,
			isActive: faker.datatype.boolean(),
			email: `orders@restaurant${index + 1}.com`,
			phone: faker.phone.number(),
			createdAt: new Date(),
			updatedAt: new Date()
		};
	})
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
		menuId: i + 1,
		title: faker.food.ethnicCategory() + i,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
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

		{ key: SettingKey.MIN_ORDER_AMOUNT, value: 30, description: 'Minimum amount required to place an order' },
		{ key: SettingKey.MAX_ORDER_ITEMS, value: 100, description: 'Maximum number of items per order' },
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
		},
		{ key: SettingKey.MAX_DISTANCE_IN_METERS, value: 5000, description: 'Max distance in meters' },
		{ key: SettingKey.MAX_CUSTOMER_ADDRESSES, value: 10, description: 'Max customer addresses' },
	]
};

const orderSeedData: SeedData<any> = {
	entity: Order,
	data: Array.from({ length: ORDERS_COUNT }, (_, index) => {
		const orderStatus = index === 0 ? OrderStatusEnum.delivered : faker.helpers.enumValue(OrderStatusEnum);
		const placedAt = orderStatus === OrderStatusEnum.delivered ? faker.date.past() : undefined;
		const deliveredAt = placedAt ? new Date(new Date(placedAt).getTime() + 360000) : undefined;
		return {
			orderId: index + 1,
			customerId: 1,
			restaurantId: faker.number.int({ min: 1, max: RESTAURANTS_COUNT }),
			deliveryAddressId: 1,
			deliveryAddress: {
				customerId: 1,
				street: faker.location.streetAddress(),
				city: faker.location.city(),
				area: faker.location.continent(),
				building: faker.location.buildingNumber(),
				floor: faker.number.int({ min: 1, max: 10 }).toString(),
				coordinates: {
					lng: parseFloat(faker.location.longitude().toString()),
					lat: parseFloat(faker.location.latitude().toString())
				},
				isDefault: false,
				label: faker.lorem.word()
			},
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

const confirmedOrders = orderSeedData.data.filter((order) => order.status === OrderStatusEnum.delivered);

// const ratingSeededData = {
// 	entity: Rating,
// 	data: Array.from({ length: confirmedOrders.length }, (_, index) => ({
// 		customerId: 1,
// 		restaurantId: 1,
// 		orderId: confirmedOrders[index].orderId,
// 		rating: faker.number.int({ min: 1, max: 5 }),
// 		comment: faker.lorem.sentence(),
// 		createdAt: new Date(),
// 		updatedAt: new Date()
// 	}))
// };

const seedData = [
	// users
	userTypesData,
	roleSeedData,
	usersData,
	customerSeedData,
	addressSeedData,

	// restaurant & menu
	cuisineSeededData,
	chainSeedData,
	restaurantSeedData,
	menuSeedData,
	itemSeedData,

	// payment methods
	paymentMethodSeedData,

	// category
	categorySeedData,

	// settings
	settingSeedData,

	// order
	orderSeedData
	// ratingSeededData
];

const seedRestaurantCuisineRelationsCB = async (dataSource: DataSource) => {
	console.log('🌱 Seeding restaurant_cuisine relations...');
	const restaurantRepository = dataSource.getRepository(Restaurant);
	const restaurants = await restaurantRepository.find();

	for (const restaurant of restaurants) {
		await dataSource
			.createQueryBuilder()
			.insert()
			.into('restaurant_cuisine')
			.values([
				{ restaurant_id: restaurant.restaurantId, cuisine_id: faker.helpers.arrayElement([1, 2, 3]) } // Adjust cuisine IDs
			])
			.execute();
	}
};

const seedRestaurantRatingRelationsCB = async (dataSource: DataSource) => {
	console.log('🌱 Seeding restaurant_rating relations...');
	const orderRepository = dataSource.getRepository(Order);

	const orders = await orderRepository.find({ where: { status: OrderStatusEnum.delivered } });

	for (const order of orders) {
		try {
			await dataSource
				.createQueryBuilder()
				.insert()
				.into('rating')
				.values([
					{
						orderId: order.orderId,
						restaurantId: order.restaurantId,
						customerId: order.customerId,
						rating: faker.number.int({ min: 1, max: 5 })
					}
				])
				.execute();
		} catch (error) {}
	}
};

export const relationsCallbacks = [seedRestaurantRatingRelationsCB, seedRestaurantCuisineRelationsCB];

export default seedData;
