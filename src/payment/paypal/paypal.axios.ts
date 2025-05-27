import { config } from '../../config/env';
import { BaseAxios } from '../../shared/baseAxios';

export class PaypalAxios extends BaseAxios {
	constructor() {
		const baseUrl = config.payment.paypal.baseUrl;
		super('PAYPAL', baseUrl);
	}
}
