// import { AbstractEntity } from '../../abstract/base.entity';
import {
	Address,
	Cart,
	CartItem,
	Customer,
	Gender,
	Item,
	Menu,
	Order,
	OrderItem,
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
// const ITEMS_COUNT = 100;
const SYSTEM_USERS_COUNT = 3;
const CUSTOMERS_COUNT = 100000;
const CHAINS_COUNT = 200;
const RESTAURANTS_COUNT = 10000;
const USERS_COUNT = CUSTOMERS_COUNT + RESTAURANTS_COUNT + SYSTEM_USERS_COUNT;
const CART_COUNT = CUSTOMERS_COUNT;
const CART_ITEMS_PER_CART = 3;
const CART_ITEMS_COUNT = CART_COUNT * CART_ITEMS_PER_CART;
const ORDERS_COUNT = 2000000;
const AVG_ITEMS_PER_ORDER = 3
const ORDER_ITEMS_COUNT = ORDERS_COUNT * AVG_ITEMS_PER_ORDER;
// const USERS_COUNT = 100;
const ADDRESSES_COUNT = 10;
// const CATEGORIES_COUNT = 10;
const MENUS_COUNT = RESTAURANTS_COUNT;
const CATEGORIES_PER_MENU = 3;
const ITEMS_PER_CATEGORY = 10;
const CATEGORIES_COUNT = MENUS_COUNT * CATEGORIES_PER_MENU;
const ITEMS_COUNT = MENUS_COUNT * CATEGORIES_PER_MENU * ITEMS_PER_CATEGORY;

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

const CUISINES = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Arabic', 'French', 'Spanish', 'Thai', 'Vietnamese', 'Korean', 'Moroccan', 'Ethiopian', 'Cuban', 'Filipino', 'Polish', 'Portuguese', 'Russian', 'Sudanese', 'Tunisian', 'Ukrainian', 'Welsh', 'Xhosa', 'Yemeni', 'Zambian', 'Egyptian'];

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

// const usersData: SeedData<User> = {
// 	entity: User,
// 	data: Array.from({ length: 100 }).map((u, idx) => {
// 		const userRoles = {
// 			0: 'customer',
// 			1: 'admin',
// 			2: 'restaurant_user'
// 		} as any;

// 		const userName = userRoles[idx] || faker.person.fullName();
// 		const userEmail = userRoles[idx] ? `${userRoles[idx]}@food.com` : faker.internet.email();
// 		const roles = idx < 3 ? [userRoles[idx]] : [faker.helpers.arrayElement(ROLES)];

// 		const user = new User();
// 		user.name = userName;
// 		user.email = userEmail;
// 		user.password = '$argon2id$v=19$m=65536,t=5,p=1$sSiFpvLPCTVNL2sZlwdgtw$oc+CZ45sNxoclIzghPOcb6p+Wrk8KFZhhodIaJ5MeVc'; // P@$$w0rd,
// 		user.phone = faker.phone.number();
// 		user.isActive = idx < 3 ? true : faker.datatype.boolean();
// 		user.userTypeId = idx < 3 ? idx + 1 : 1;

// 		if (userRoles[idx]) user.roles = [{ roleId: 1 + ROLES.findIndex((role) => role === userRoles[idx]) }] as Role[];
// 		else user.roles = [{ roleId: 1 }] as Role[];

// 		return user;
// 	})
// };

const usersData: SeedData<User> = {
	entity: User,
	data: Array.from({ length: USERS_COUNT }).map((_, idx) => {
		// Define role assignment
		let roleName: string;
		let userTypeId: number;

		if (idx === 0) {
			roleName = 'customer';
			userTypeId = 1;
		} else if (idx === 1) {
			roleName = 'admin';
			userTypeId = 2;
		} else if (idx === 2) {
			roleName = 'restaurant_user';
			userTypeId = 3;
		} else if (idx < SYSTEM_USERS_COUNT + CUSTOMERS_COUNT) {
			roleName = 'customer';
			userTypeId = 1;
		} else {
			roleName = 'restaurant_user';
			userTypeId = 3;
		}

		const emailPrefix = roleName.replace('_', '');
		const email =
			idx < 3
				? `${roleName}@food.com`
				: `${emailPrefix}${idx - SYSTEM_USERS_COUNT + 1}@food.com`;

		const user = new User();
		user.name =
			idx < 3
				? roleName.charAt(0).toUpperCase() + roleName.slice(1)
				: faker.person.fullName();
		user.email = email;
		user.phone = faker.phone.number();
		user.password =
			'$argon2id$v=19$m=65536,t=5,p=1$sSiFpvLPCTVNL2sZlwdgtw$oc+CZ45sNxoclIzghPOcb6p+Wrk8KFZhhodIaJ5MeVc'; // 'P@$$w0rd'
		user.isActive = true;
		user.userTypeId = userTypeId;

		const roleIndex = ROLES.findIndex((r) => r === roleName);
		user.roles = [{ roleId: roleIndex + 1 }] as any;

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



// const addressSeedData: SeedData<Address> = {
// 	entity: Address,
// 	data: (() => {
// 		const data: Partial<Address>[] = [];

// 		for (let customerId = 1; customerId <= CUSTOMERS_COUNT; customerId++) {
// 			const addressCount = faker.number.int({ min: 3, max: 10 });
// 			for (let i = 0; i < addressCount; i++) {
// 				data.push({
// 					customerId,
// 					street: faker.location.streetAddress(),
// 					city: faker.location.city(),
// 					area: faker.location.continent(),
// 					building: faker.location.buildingNumber(),
// 					floor: faker.number.int({ min: 1, max: 10 }).toString(),
// 					geoLocation: {
// 						type: 'Point',
// 						coordinates: [
// 							parseFloat(faker.location.longitude().toString()),
// 							parseFloat(faker.location.latitude().toString())
// 						]
// 					},
// 					isDefault: false,
// 					label: faker.lorem.word()
// 				});
// 			}
// 		}

// 		return data;
// 	})()
// };

const addressSeedData: SeedData<Address> = {
	entity: Address,
	data: Array.from({ length: CUSTOMERS_COUNT }).map((_, index) => ({
		customerId: faker.number.int({ min: 1, max: CUSTOMERS_COUNT }),
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
	data: Array.from({ length: CUSTOMERS_COUNT }).map((_, index) => ({
		userId: index + 1, // assuming userId starts from 1
		birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
		gender: faker.helpers.arrayElement(Object.values(Gender))
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
	data: Array.from({ length: CHAINS_COUNT }).map((_, index) => ({
		chainId: index + 1,
		name: `${faker.company.name()} ${index + 1}`,
		commercialRegistrationNumber: faker.string.alphanumeric(10),
		vatNumber: faker.string.alphanumeric(12),
		createdAt: new Date(),
		updatedAt: new Date()
	}))
};

const restaurantSeedData: SeedData<Restaurant> = {
	entity: Restaurant,
	data: Array.from({ length: RESTAURANTS_COUNT }).map((_, index) => {
		const chainId = faker.number.int({ min: 1, max: CHAINS_COUNT });
		return {
			chainId,
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
			totalRating: faker.number.int({ min: 0, max: 5 }),
			ratingCount: faker.number.int({ min: 0, max: 5 }),
			averageRating: faker.number.float({ min: 0, max: 5 }),
			createdAt: new Date(),
			updatedAt: new Date()
		};
	})
};

// * Menu

const menuSeedData: SeedData<Menu> = {
	entity: Menu,
	data: Array.from({ length: MENUS_COUNT }).map((_, index) => ({
		isActive: true,
		restaurantId: index + 1
	}))
};

// category
const categorySeedData: SeedData<Category> = {
	entity: Category,
	data: Array.from({ length: CATEGORIES_COUNT }).map((_, i) => ({
		menuId: faker.number.int({ min: 1, max: MENUS_COUNT }),
		title: faker.food.ethnicCategory() + i,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	}))
};

const itemSeedData: SeedData<Item> = {
	entity: Item,
	data: Array.from({ length: ITEMS_COUNT }).map((_, index) => ({
		restaurantId: faker.number.int({ min: 1, max: RESTAURANTS_COUNT }),
		imagePath: faker.image.url(),
		name: faker.food.dish() + `${index + 1}`,
		description: faker.food.description(),
		price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
		energyValCal: parseFloat(faker.number.float({ min: 50, max: 500 }).toFixed(2)),
		notes: faker.lorem.sentence(),
		isAvailable: faker.datatype.boolean()
	}))
};

const cartSeedData: SeedData<Cart> = {
	entity: Cart,
	data: Array.from({ length: CART_COUNT }).map((_, index) => ({
		customerId: index + 1,
		createdAt: new Date(),
		updatedAt: new Date()
	}))
};

const cartItemSeedData: SeedData<CartItem> = {
	entity: CartItem,
	data: Array.from({ length: CART_ITEMS_COUNT }).map((_, index) => {
		const cartId = Math.floor(index / 3) + 1;
		return {
			cartId,
			restaurantId: faker.number.int({ min: 1, max: RESTAURANTS_COUNT }),
			itemId: index + 1,
			quantity: faker.number.int({ min: 1, max: 15 }),
			price: faker.number.float({ min: 5, max: 50 }),
			totalPrice: faker.number.float({ min: 5, max: 50 }),
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

const orderSeedData: SeedData<any> = {
	entity: Order,
	data: Array.from({ length: ORDERS_COUNT }, (_, index) => {
		const customerId = faker.number.int({ min: 1, max: CUSTOMERS_COUNT });
		const orderStatus = index === 0 ? OrderStatusEnum.delivered : faker.helpers.enumValue(OrderStatusEnum);
		const placedAt = orderStatus === OrderStatusEnum.delivered ? faker.date.past() : undefined;
		const deliveredAt = placedAt ? new Date(new Date(placedAt).getTime() + 360000) : undefined;

		return {
			orderId:index + 1,
			customerId,
			restaurantId: faker.number.int({ min: 1, max: RESTAURANTS_COUNT }),
			deliveryAddressId: faker.number.int({ min: 1, max: ADDRESSES_COUNT }),
			deliveryAddress: {
				customerId,
				street: faker.location.streetAddress(),
				city: faker.location.city(),
				area: faker.location.continent(),
				building: faker.location.buildingNumber(),
				floor: faker.number.int({ min: 1, max: 10 }).toString(),
				coordinates: {
					lng: parseFloat(faker.location.longitude().toString()),
					lat: parseFloat(faker.location.latitude().toString())
				},
				isDefault: faker.datatype.boolean(),
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


const orderItemsSeedData: SeedData<OrderItem> = {
	entity: OrderItem,
	data: Array.from({ length: ORDER_ITEMS_COUNT }, (_, index) => {
		const orderId = Math.floor(index / 3) + 1; // 3 items per order
		return {
			orderId,
			itemId: faker.number.int({ min: 1, max: ITEMS_COUNT }),
			quantity: faker.number.int({ min: 1, max: 5 }),
			price: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
			totalPrice: parseFloat(faker.commerce.price({ min: 5, max: 5000 })),
			createdAt: new Date(),
		};
	}),
};

const confirmedOrders = orderSeedData.data.filter(order => order.status === OrderStatusEnum.delivered);

const ratingSeededData: SeedData<Rating> = {
	entity: Rating,
	data: confirmedOrders.slice(0, confirmedOrders.length / 2).map((order) => ({
		customerId: order.customerId,
		restaurantId: order.restaurantId,
		orderId: order.orderId,
		rating: faker.number.int({ min: 1, max: 5 }),
		comment: faker.lorem.sentence(),
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
		{ key: SettingKey.MIN_ESTIMATED_DELIVERY_TIME, value: 10, description: 'Min estimated delivery time in minutes' },
		{ key: SettingKey.MAX_ESTIMATED_DELIVERY_TIME, value: 60, description: 'Max estimated delivery time in minutes' }
	]
};

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
	categorySeedData,
	itemSeedData,

	// payment methods
	paymentMethodSeedData,

	// settings
	settingSeedData,

	// cart
	cartSeedData,
	cartItemSeedData,

	// order
	orderSeedData,
	orderItemsSeedData,
	ratingSeededData
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

const seedCategoryItemRelationsCB = async (dataSource: DataSource) => {
	console.log('🌱 Seeding category_item relations...');

	const categoryRepo = dataSource.getRepository(Category);
	const itemRepo = dataSource.getRepository(Item);

	const categories = await categoryRepo.find();
	const items = await itemRepo.find({ select: ['itemId'] });

	const allItemIds = items.map((item) => item.itemId);

	const categoryItemRelations = [];

	for (const category of categories) {
		const itemCount = faker.number.int({ min: 3, max: 6 });
		const randomItemIds = faker.helpers.arrayElements(allItemIds, itemCount);

		for (const itemId of randomItemIds) {
			categoryItemRelations.push({
				category_id: category.categoryId,
				item_id: itemId
			});
		}
	}

	// Batch insert
	const BATCH_SIZE = 1000;
	for (let i = 0; i < categoryItemRelations.length; i += BATCH_SIZE) {
		const batch = categoryItemRelations.slice(i, i + BATCH_SIZE);
		await dataSource
			.createQueryBuilder()
			.insert()
			.into('category_items')
			.values(batch)
			.execute();
	}

	console.log(`✅ Seeded ${categoryItemRelations.length} category-item relations.`);
};


export const relationsCallbacks = [seedRestaurantRatingRelationsCB, seedRestaurantCuisineRelationsCB, seedCategoryItemRelationsCB];

export default seedData;
