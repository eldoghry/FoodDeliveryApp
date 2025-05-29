import { config } from '../../../config/env';
import { PaypalAuthUrl, PaypalCaptureOrder, PaypalCreateOrderUrl } from './paypal.request';
import logger from '../../../config/logger';
import { PaypalAxios } from './paypal.axios';
import { BaseAxios } from '../../../shared/baseAxios';
import {
	CreateOrderBodyRequest,
	PaypalAuthResponse,
	PaypalCaptureResponse,
	PaypalCreateOrderResponse
} from './paypal.interface';
import { v4 as UUIDV4 } from 'uuid';

const orderData = {
	purchase_units: [
		{
			invoice_id: '90210',
			amount: {
				currency_code: 'USD',
				value: '230.00',
				breakdown: {
					item_total: {
						currency_code: 'USD',
						value: '220.00'
					},
					shipping: {
						currency_code: 'USD',
						value: '10.00'
					}
				}
			},
			items: [
				{
					name: 'T-Shirt',
					description: 'Super Fresh Shirt',
					unit_amount: {
						currency_code: 'USD',
						value: '20.00'
					},
					quantity: '1',
					category: 'PHYSICAL_GOODS',
					sku: 'sku01',
					image_url: 'https://example.com/static/images/items/1/tshirt_green.jpg',
					url: 'https://example.com/url-to-the-item-being-purchased-1',
					upc: {
						type: 'UPC-A',
						code: '123456789012'
					}
				},
				{
					name: 'Shoes',
					description: 'Running, Size 10.5',
					sku: 'sku02',
					unit_amount: {
						currency_code: 'USD',
						value: '100.00'
					},
					quantity: '2',
					category: 'PHYSICAL_GOODS',
					image_url: 'https://example.com/static/images/items/1/shoes_running.jpg',
					url: 'https://example.com/url-to-the-item-being-purchased-2',
					upc: {
						type: 'UPC-A',
						code: '987654321012'
					}
				}
			]
		}
	]
};

export class Paypal {
	private static instance: Paypal;
	private readonly client: BaseAxios;
	private accessToken: string | null = null;
	private tokenExpiryTime: number | null = null;

	private constructor() {
		this.client = new PaypalAxios();
	}

	static getInstance(): Paypal {
		if (!this.instance) this.instance = new Paypal();
		return this.instance;
	}

	private async login(): Promise<void> {
		const CLIENT_ID = config.payment.paypal.clientId;
		const CLIENT_SECRET = config.payment.paypal.secretKey;
		const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

		const data = new URLSearchParams();
		data.append('grant_type', 'client_credentials');

		const response: PaypalAuthResponse = await this.client.axios.post(PaypalAuthUrl, data, {
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		this.accessToken = response.access_token;
		this.tokenExpiryTime = Date.now() + response.expires_in * 1000 - 60000; // Subtract 1 minute for safety
		logger.info('PayPal access token obtained successfully');
	}

	private async ensureAccessToken(): Promise<void> {
		const now = Date.now();
		if (!this.accessToken || !this.tokenExpiryTime || now >= this.tokenExpiryTime) {
			await this.login();
		}
	}

	async createOrder(payload: CreateOrderBodyRequest): Promise<PaypalCreateOrderResponse> {
		await this.ensureAccessToken();

		const response: PaypalCreateOrderResponse = await this.client.axios.post(
			PaypalCreateOrderUrl,
			// {
			// 	intent: 'CAPTURE',
			// 	payment_source: {
			// 		paypal: {
			// 			experience_context: {
			// 				payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
			// 				landing_page: 'LOGIN',
			// 				shipping_preference: 'GET_FROM_FILE',
			// 				user_action: 'PAY_NOW',
			// 				return_url: 'https://example.com/returnUrl',
			// 				cancel_url: 'https://example.com/cancelUrl'
			// 			}
			// 		}
			// 	},
			// 	...orderData
			// }
			payload,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		return response;
	}

	async capturePayment(paypalOrderId: string): Promise<PaypalCaptureResponse> {
		await this.ensureAccessToken();

		const paypalCaptureUrl = PaypalCaptureOrder(paypalOrderId);

		const response: any = await this.client.axios.post(
			paypalCaptureUrl,
			{},
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
					'PayPal-Request-Id': UUIDV4()
				}
			}
		);

		return response;
	}
}
