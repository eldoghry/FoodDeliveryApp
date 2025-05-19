import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
    private cartService = new CartService();

    async clearCart(req: Request, res: Response) {
				const { cartId } = req.validated?.params;
				
				await this.cartService.clearCart(cartId);
				sendResponse(res, StatusCodes.OK, 'Cart Cleared Successfully');
	}
}
