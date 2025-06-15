import { RestaurantService } from '../../services/restaurant.service';
import { CheckoutHandler, CheckoutContext } from './checkout.handler';

export class ValidateRestaurantHandler extends CheckoutHandler {
	constructor(private restaurantService: RestaurantService) {
		super();
	}

	async handleRequest(context: CheckoutContext) {
		const { restaurantId } = context.payload;
		context.restaurant = await this.restaurantService.getRestaurantOrFail({ restaurantId });
		return context;
	}
}
