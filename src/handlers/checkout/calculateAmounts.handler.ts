import { SettingService } from './../../services/setting.service';
import { CheckoutContext, CheckoutHandler } from './checkout.handler';
import { SettingKey } from '../../enums/setting.enum';
import { Cart } from '../../models';

export class CalculateAmountsHandler extends CheckoutHandler {
	constructor() {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const [serviceFees, deliveryFees] = await Promise.all([
			(await SettingService.get(SettingKey.SERVICE_BASE_FEE)) as number,
			(await SettingService.get(SettingKey.DELIVERY_BASE_FEE)) as number
		]);

		context.serviceFees = serviceFees;
		context.deliveryFees = deliveryFees;
		context.totalAmount = Cart.calculateTotalPrice(context.cart!.cartItems, serviceFees, deliveryFees);
		return context;
	}
}
