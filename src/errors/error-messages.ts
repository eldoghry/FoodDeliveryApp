import { forbidden } from 'joi';

const ErrMessages = {
	// Common Errors
	http: {
		BadRequest: 'Bad Request',
		Unauthorized: 'Unauthorized',
		Forbidden: 'Forbidden',
		NotFound: 'Not Found',
		InternalServerError: 'Internal Server Error'
	},
	validation: {
		// Validation Errors
		ValidationError: 'Validation Error',
		InvalidInput: 'Invalid Input'
	},

	auth: {
		// Authentication Errors
		InvalidCredentials: 'Invalid Credentials',
		TokenExpired: 'Token Expired',
		TokenInvalid: 'Token Invalid',
		AccessDenied: 'Access Denied',
		forbidden: 'You do not have permission to access this resource.'
	},

	database: {
		// Database Errors
		DatabaseConnectionError: 'Database Connection Error',
		RecordNotFound: 'Record Not Found'
	},

	file: {
		// File Upload Errors
		FileTooLarge: 'File Too Large',
		UnsupportedFileType: 'Unsupported File Type'
	},

	misc: {
		// Miscellaneous Errors
		UnknownError: 'Unknown Error'
	},

	rateLimit: {
		// Rate Limiting Errors
		TooManyRequests: 'Too Many Requests'
	},
	cors: {
		// CORS Errors
		CorsError: 'CORS Error'
	},

	// Custom Errors
	// todo: add custom errors here
	cart: {
		CartNotFound: 'Cart Not Found',
		CartAlreadyExists: 'Cart Already Exists',
		CartItemNotFound: 'Cart Item Not Found',
		CartItemAlreadyExistOnCart: 'Item already exist on cart',
		CartItemDoesNotBelongToTheSpecifiedCart: 'Cart Item Does Not Belong To The Specified Cart',
		FailedToUpdateCartItem: 'Failed to update cart item',
		FailedToUpdateCart: 'Failed to update cart',
		CartIsEmpty: 'Cart is empty',
		CartIsNotActive: 'Cart is not active',
		FailedToClearCart: 'Failed to clear cart',
		FailedToDeleteCartItem: 'Failed to delete cart item'
	},
	order: {
		InvalidOrderStatus: 'Invalid Order Status',
		OrderNotFound: 'Order Not Found',
		CannotCancelOrderAfter5Minutes: 'Cannot cancel order after 5 minutes of placing it',
		FailedToUpdateOrderStatus: 'Failed to update order status',
		FailedToAddOrderStatusLog: 'Failed to add order status log',
		OrderNotCompleted: 'Order is not completed',
		UnauthorizedOrderAccess: 'You are not authorized to access this order'
	},
	user:{
		EmailAlreadyExists: 'Email Already Exists',
		PhoneAlreadyExists: 'Phone Already Exists',
	},
	customer: {
		CustomerNotFound: 'Customer not found',
		AddressNotFound: 'Customer Address not found',
		ReachedAddressLimit:'You\'ve reached your address limit. Please remove one to add a new address.',
		AddressDoesntBelongToCustomer:'This address does not belong to the specified customer.',
		AtLeastOneDefaultAddress:'There must be at least one default address',
		AddressUsedInActiveOrder:'Action not allowed - This address is being used in a current order.',
		CustomerHasActiveOrder:'Deactivation not allowed - This customer has active order'
	},

	restaurant: {
		RestaurantNotFound: 'Restaurant not found',
		RestaurantNotAvailable:
			'Sorry restaurant cannot process your order right now, try again later or choose different one',
		ChainNameAlreadyExists: 'Chain name already exists',
		ChainCommercialRegistrationNumberAlreadyExists: 'Chain commercial registration number already exists',
		ChainVatNumberAlreadyExists: 'Chain vat number already exists',
		RestaurantNameAlreadyExists: 'Restaurant name already exists',
		RestaurantHasActiveOrders: 'Deactivation not allowed - Restaurant has active orders',
		RestaurantDoesNotBelongToUser: 'Action not allowed - Restaurant does not belong to user',
		RestaurantIsNotActive: 'Action not allowed - Restaurant is already deactivated',
		RestaurantIsActive: 'Action not allowed - Restaurant is already activated',
		RestaurantIsNotApproved: 'Action not allowed - Restaurant is not approved',
		RestaurantDectivatedBySystemAdmin: 'Restaurant is deactivated by system admin - please contact support',
		RestaurantIsNotActivated: 'Action not allowed - Restaurant is not activated',
	},

	item: {
		ItemNotFound: 'Item Not Found',
		ItemPriceNotFound: 'Item price not found',
		ItemNameAlreadyExists: 'Item name already exists',
		ItemNotBelongsToMenu: 'Item does not belong to the specified restaurant menu',
		ItemAlreadyAvailable:'Item Already Available',
		ItemAlreadyUnAvailable:'Item Already UnAvailable'
	},

	menu: {
		NoActiveMenuFound: 'Sorry there is no active menu for current restaurant',
		MenuAlreadyExist:'Already Exist Active Menu For the Restaurant',
		ItemNotBelongToActiveMenu: 'Item does not belong to an active menu of this restaurant',
		CategoryNotFound: 'Category Not Found',
		CategoryNotBelongsToMenu: 'Category does not belong to the specified restaurant menu',
		CategoryTitleAlreadyExists: 'Category title already exists',
		CategoryAlreadyActive: 'Category is already active',
		CategoryAlreadyInactive: 'Category is already inactive',
		CategoryContainsItems: 'Deletion not allowed - Category contains items'
	},

	payment: {
		PaymentFailed: 'Payment failed'
	},

	setting: {
		SettingNotFound: 'Setting Not Found'
	},

	transaction: {
		TransactionNotFound: 'Transaction Not Found',
		TransactionCreationFailed: 'Transaction Creation Failed',
		TransactionIdOrReferenceRequired: 'Transaction Id or Reference is Required'
	},

	rating: {
		RatingNotFound: 'Rating Not Found',
		RatingAlreadyExists: 'Rating Already Exists',
		FailedToAddRating: 'Failed to add rating',
		FailedToUpdateRating: 'Failed to update rating',
		OrderNotCompleted: 'Order is not completed, cannot add rating',
		RatingNotBelongToOrder: 'Rating does not belong to the specified order',
		RatingPeriodExpired: 'Rating period has expired'
	}
};

export default ErrMessages;
