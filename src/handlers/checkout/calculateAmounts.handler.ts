import { SettingService } from './../../services/setting.service';
import { calculateTotalPrice } from '../../utils/helper';
import { CheckoutContext, CheckoutHandler } from './checkout.handler';
import { SettingKey } from '../../enums/setting.enum';

export class CalculateAmountsHandler extends CheckoutHandler {
	constructor() {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		context.serviceFees = (await SettingService.get(SettingKey.SERVICE_BASE_FEE)) as number;
		context.deliveryFees = (await SettingService.get(SettingKey.DELIVERY_BASE_FEE)) as number;
		context.totalAmount = calculateTotalPrice(context.cart!.cartItems, context.serviceFees, context.deliveryFees);

		return context;
	}
}
