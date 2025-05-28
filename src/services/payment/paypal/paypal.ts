import axios, { AxiosInstance } from 'axios';
import { config } from '../../../config/env';
import { PaypalAuthUrl, PaypalCaptureOrder, PaypalCreateOrderUrl } from './paypal.request';
import logger from '../../../config/logger';
import ApplicationError from '../../../errors/application.error';
import { StatusCodes } from 'http-status-codes';
import { PaypalAxios } from './paypal.axios';
import { BaseAxios } from '../../../shared/baseAxios';
import { CreateOrderBodyRequest, PaypalCaptureResponse } from './paypal.interface';
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
	private readonly client: BaseAxios;
	private accessToken: string | null = null;

	constructor() {
		this.client = new PaypalAxios();
	}

	private async login(): Promise<void> {
		console.log('login start');
		const CLIENT_ID = config.payment.paypal.clientId;
		const CLIENT_SECRET = config.payment.paypal.secretKey;
		const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

		const data = new URLSearchParams();
		data.append('grant_type', 'client_credentials');

		const response: any = await this.client.axios.post(PaypalAuthUrl, data, {
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		this.accessToken = response.access_token;
	}

	private async ensureAccessToken() {
		if (!this.accessToken) await this.login();
	}

	async createOrder(payload: CreateOrderBodyRequest) {
		// await this.ensureAccessToken();
		await this.login();
		const response: any = await this.client.axios.post(
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
		// await this.ensureAccessToken();
		await this.login();
		const url = PaypalCaptureOrder(paypalOrderId);

		const response: any = await this.client.axios.post(
			url,
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
