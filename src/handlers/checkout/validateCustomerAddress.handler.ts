import { CustomerService } from '../../services/customer.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ValidateCustomerAddressHandler extends CheckoutHandler {
	constructor(private customerService: CustomerService) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const { customerId, addressId } = context.payload;
		context.address = await this.customerService.validateCustomerAddress(customerId, addressId);
		return context;
	}
}
