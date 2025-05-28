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
	// items: Item[];
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

export interface PayPalWebhookEvent {
	id: string;
	event_version: string;
	create_time: string;
	resource_type: string;
	event_type: string;
	summary: string;
	resource: any;
	links: Array<{
		href: string;
		rel: string;
		method: string;
	}>;
}

export interface PaypalCaptureResponse {
	id: string;
	status: string;
	purchase_units: PurchaseUnit[];
}
