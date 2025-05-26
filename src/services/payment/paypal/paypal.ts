import axios from 'axios';
import { config } from './../../../config/env';
import { PaypalAuthUrl, PaypalCreateOrderUrl } from './paypal.request';
import logger from '../../../config/logger';
import ApplicationError from '../../../errors/application.error';

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
	private readonly client: Axios.AxiosInstance;
	private accessToken: string | null = null;
	private readonly baseURL: string;

	constructor() {
		this.baseURL = config.payment.paypal.baseUrl;
		this.client = axios.create({ baseURL: this.baseURL });
	}

	private async login(): Promise<void> {
		console.log('login start');
		const CLIENT_ID = config.payment.paypal.clientId;
		const CLIENT_SECRET = config.payment.paypal.secretKey;
		const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`);

		const data = new URLSearchParams();
		data.append('grant_type', 'client_credentials');
		try {
			const response: any = await this.client.post(PaypalAuthUrl, data, {
				headers: {
					Authorization: `Basic ${credentials}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			console.log('resp', response.data);
			this.accessToken = response.data.access_token;
			console.log('login finish');
		} catch (error) {
			logger.error('Paypal login error', error);
			throw new ApplicationError('Paypal login is down');
		}
	}

	private async ensureAccessToken() {
		if (!this.accessToken) await this.login();
	}

	async createOrder() {
		await this.ensureAccessToken();
		console.log('create order start');
		const response: any = await this.client.post(
			PaypalCreateOrderUrl,
			{
				intent: 'CAPTURE',
				payment_source: {
					paypal: {
						experience_context: {
							payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
							landing_page: 'LOGIN',
							shipping_preference: 'GET_FROM_FILE',
							user_action: 'PAY_NOW',
							return_url: 'https://example.com/returnUrl',
							cancel_url: 'https://example.com/cancelUrl'
						}
					}
				},
				...orderData
			},
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		console.log('response.data', response.data);
		console.log('create order finish');
		return response.data;
	}

	async capturePayment() {}
}
