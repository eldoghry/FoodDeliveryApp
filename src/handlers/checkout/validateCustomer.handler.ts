import { CustomerService } from '../../services/customer.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ValidateCustomerHandler extends CheckoutHandler {
	constructor(private customerService: CustomerService) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const { customerId } = context.payload;

		context.customer = await this.customerService.getCustomerByIdOrFail({
			customerId,
			relations: ['user', 'addresses']
		});

		return context;
	}
}
