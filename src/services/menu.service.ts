import { StatusCodes } from "http-status-codes";
import ApplicationError from "../errors/application.error";
import ErrMessages from "../errors/error-messages";
import { MenuRepository } from "../repositories";

export class MenuService {
	private menuRepo = new MenuRepository();

	async getMenuDetails(restaurantId: number) {
		return await this.menuRepo.getMenuByRestaurantId(restaurantId);
	}


    /* Validation Methods */
    
}
