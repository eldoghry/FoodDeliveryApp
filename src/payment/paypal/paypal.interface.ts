interface AmountBreakdown {
	item_total: {
		currency_code: string;
		value: string;
	};
	shipping: {
		currency_code: string;
		value: string;
	};
}

interface Amount {
	currency_code: string;
	value: string;
	breakdown: AmountBreakdown;
}

interface UPC {
	type: string;
	code: string;
}

interface Item {
	name: string;
	description: string;
	unit_amount: {
		currency_code: string;
		value: string;
	};
	quantity: string;
	category: 'PHYSICAL_GOODS' | 'DIGITAL_GOODS' | 'FOOD'; // Add other possible categories
	sku: string;
	image_url?: string;
	url?: string;
	upc?: UPC;
}

interface PurchaseUnit {
	invoice_id: string;
	amount: Amount;
	items: Item[];
}

interface PaymentOrder {
	purchase_units: PurchaseUnit[];
}
