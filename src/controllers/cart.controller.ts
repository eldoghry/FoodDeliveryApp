import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
	private cartService = new CartService();

	async addItem(req: Request, res: Response) {
		const payload = req.validated?.body;

		const result = await this.cartService.addItem({ ...payload, customerId: req.user?.userId });
		sendResponse(res, HttpStatusCodes.OK, 'Item added to cart', result);
	}
}
