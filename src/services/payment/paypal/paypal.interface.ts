// interface AmountBreakdown {
// 	item_total: {
// 		currency_code: string;
// 		value: string;
// 	};
// 	shipping: {
// 		currency_code: string;
// 		value: string;
// 	};
// }

interface Amount {
	currency_code: string;
	value: string;
	// breakdown: AmountBreakdown;
}

interface UPC {
	type: string;
	code: string;
}

interface Item {
	name: string;
	// description: string;
	unit_amount: {
		currency_code: 'USD';
		value: string;
	};
	quantity: string;
	// category: 'PHYSICAL_GOODS' | 'DIGITAL_GOODS' | 'FOOD'; // Add other possible categories
	// sku: string;
	// image_url?: string;
	// url?: string;
	// upc?: UPC;
}

interface PurchaseUnit {
	// invoice_id: string;
	reference_id: string;
	amount: Amount;
	payments?: Record<string, any>;
	custom_id: string; // The API caller-provided external ID will be used as our order id.
}

interface PaymentOrder {
	purchase_units: PurchaseUnit[];
}

interface ApplicationContext {
	return_url: string;
	cancel_url: string;
}

export interface CreateOrderBodyRequest {
	purchase_units: PurchaseUnit[];
	intent: 'CAPTURE' | 'AUTHORIZE';
	application_context: ApplicationContext;
}

interface PayPalWebhookEventResource {
	id: string; // paypal order id
	purchase_units: {
		custom_id: string; // order id that send by our system
		reference_id: string; // transaction reference number that send by our system
		amount: { currency_code: 'USD'; value: string; breakdown: Record<string, any> };
	}[];
	payment_source: Record<string, any>;
	links: Array<{
		href: string;
		rel: string;
		method: string;
	}>;
	status: string;
}
export interface PayPalWebhookEvent {
	id: string;
	event_version: string;
	create_time: string;
	resource_type: string;
	event_type: string;
	summary: string;
	resource: PayPalWebhookEventResource;
}

export interface PaypalCaptureResponse {
	id: string;
	status: string;
	purchase_units: PurchaseUnit[];
}

export interface PaypalAuthResponse {
	scope: string;
	access_token: string; //  OAuth 2.0 access token
	token_type: string; // Typically "Bearer", indicating the type of the token.
	app_id: string; //The ID of the PayPal app associated with this token.
	expires_in: number; // The number of seconds until the token expires (e.g., 31668 seconds ≈ 8.8 hours).
	nonce: string; //
}

export interface PaypalCreateOrderResponse {
	id: string; // The unique identifier for the created order.
	status: string; // The status of the order (e.g., "CREATED", "APPROVED").
	// purchase_units: PurchaseUnit[]; // An array of purchase units associated with the order.
	links: Array<{
		href: string; // The URL to access the resource.
		rel: string; // The relationship type (e.g., "self", "approve").
		method: string; // The HTTP method to use for the link (e.g., "GET", "POST").
	}>;
}
