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
		FailedToAddOrderStatusLog: 'Failed to add order status log'
	},
	customer: {
		CustomerNotFound: 'Customer not found',
		AddressNotFound: 'Customer Address not found',
		ReachedAddressLimit:"You've reached your address limit. Please remove one to add a new address.",
		AddressDoesntBelongToCustomer:'This address does not belong to the specified customer.'
	},

	restaurant: {
		RestaurantNotFound: 'Restaurant not found',
		RestaurantNotAvailable:
			'Sorry restaurant cannot process your order right now, try again later or choose different one'
	},

	item: {
		ItemNotFound: 'Item Not Found',
		ItemPriceNotFound: 'Item price not found'
	},

	menu: {
		NoActiveMenuFound: 'Sorry there is no active menu for current restaurant',
		ItemNotBelongToActiveMenu: 'Item does not belong to an active menu of this restaurant'
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
	}
};

export default ErrMessages;
