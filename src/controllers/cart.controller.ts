import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';
import { sendResponse } from '../utils/sendResponse';
import { AuthorizedUser } from '../middlewares/auth.middleware';

export class CartController {
	private cartService = new CartService();

	async addItem(req: Request, res: Response) {
		const payload = req.validated?.body;

		const result = await this.cartService.addItemToCart({ ...payload, customerId: req.user?.actorId });
		sendResponse(res, HttpStatusCodes.CREATED, 'Item added to cart', result);
	}

	async viewCart(req: Request, res: Response) {
		const { actorId } = req.user as AuthorizedUser;
		const cart = await this.cartService.viewCart(Number(actorId));
		sendResponse(res, HttpStatusCodes.OK, 'Cart details', cart);
	}

	async updateQuantity(req: Request, res: Response) {
		const { actorId } = req.user as AuthorizedUser;
		const { cartItemId } = req.validated?.params;
		const { quantity } = req.validated?.body;

		const cartItem = await this.cartService.updateCartItemQuantity(Number(actorId), Number(cartItemId), {
			quantity: Number(quantity)
		});
		sendResponse(res, HttpStatusCodes.OK, 'Cart Item Updated', cartItem);
	}

	async clearCart(req: Request, res: Response) {
		const { actorId } = req.user as AuthorizedUser;
		const cartItem = await this.cartService.clearCart(Number(actorId));
		sendResponse(res, HttpStatusCodes.NO_CONTENT, 'Cart Cleared', cartItem);
	}

	async deleteCartItem(req: Request, res: Response) {
		const { cartItemId } = req.validated?.params;
		const { actorId } = req.user as AuthorizedUser;
		const cartItem = await this.cartService.deleteCartItem(Number(actorId), Number(cartItemId));
		sendResponse(res, HttpStatusCodes.NO_CONTENT, 'Cart Item Deleted', cartItem);
	}
}
