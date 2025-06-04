import { Customer } from '../../models';
import { CustomerService } from '../../services/customer.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ValidateCustomerAddressHandler extends CheckoutHandler {
	constructor(private customerService: CustomerService) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const { customer } = context;
		const { addressId } = context.payload;
		this.customerService.validateCustomerAddress(customer as Customer, addressId);
		return context;
	}
}
