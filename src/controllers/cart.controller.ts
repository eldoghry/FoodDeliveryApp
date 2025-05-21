import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';
import { sendResponse } from '../utils/sendResponse';

export class CartController {
	private cartService = new CartService();

	async addItem(req: Request, res: Response) {
		const payload = req.validated?.body;

		const result = await this.cartService.addItem({ ...payload, customerId: req.user?.userId });
		sendResponse(res, HttpStatusCodes.CREATED, 'Item added to cart', result);
	}

	async viewCart(req: Request, res: Response) {
		const { cartId } = req.validated?.params;
		const cart = await this.cartService.viewCart(Number(cartId));
		sendResponse(res, HttpStatusCodes.OK, 'Cart details', cart);
	}

	async updateQuantity(req: Request, res: Response) {
		const { cartId, cartItemId } = req.validated?.params;
		const { quantity } = req.validated?.body;
		const cartItem = await this.cartService.updateCartItemQuantity(Number(cartId), Number(cartItemId), {
			quantity: Number(quantity)
		});
		sendResponse(res, HttpStatusCodes.OK, 'Cart Item Updated', cartItem);
	}

	async clearCart(req: Request, res: Response) {
		const { cartId } = req.validated?.params;
		const cartItem = await this.cartService.clearCart(cartId);
		sendResponse(res, HttpStatusCodes.NO_CONTENT, 'Cart Cleared', cartItem);
	}

	async deleteCartItem(req: Request, res: Response) {
		const { cartId, cartItemId } = req.validated?.params;
		const cartItem = await this.cartService.deleteCartItem(cartId, cartItemId);
		sendResponse(res, HttpStatusCodes.NO_CONTENT, 'Cart Cleared', cartItem);
	}

	// for test only
	async getAllCarts(req: Request, res: Response) {
		const carts = await this.cartService.getAllCarts();
		sendResponse(res, HttpStatusCodes.OK, 'Carts', carts);
	}
}
