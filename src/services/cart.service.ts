import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { CartRepository } from '../repositories/cart.repository';
import ErrMessages from '../errors/error-messages';

export class CartService {
	private cartRepo = new CartRepository();

	async removeItem(cartItemId: number) {
		const cartItem = await this.cartRepo.getCartItem(cartItemId);

		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
		}

		const cart = await this.cartRepo.getCartById(cartItem.cartId);
		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}

    // TODO: validate that the customer owns the cart

		if (!cart.isActive) {
			throw new ApplicationError(ErrMessages.cart.CartNotActive, StatusCodes.BAD_REQUEST);
		}

		await this.cartRepo.deleteCartItem(cartItemId);
		await this.cartRepo.updateCartTotalItems(cart.cartId);
	}
}
