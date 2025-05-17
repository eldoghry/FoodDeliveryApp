import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { CartRepository } from '../repositories/cart.repository';
import ErrMessages from '../errors/error-messages';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';

export class CartService {
	async removeItem(cartItemId: number) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			const cartItem = await transactionalEntityManager.findOne(CartItem, {
				where: { cartItemId },
				relations: ['cart']
			});

			if (!cartItem) {
				throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);
			}

			const cart = cartItem.cart;
			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			// TODO: validate that the customer owns the cart

			if (!cart.isActive) {
				throw new ApplicationError(ErrMessages.cart.CartNotActive, StatusCodes.BAD_REQUEST);
			}

			await transactionalEntityManager.delete(CartItem, cartItemId);

			const cartItems = await transactionalEntityManager.find(CartItem, {
				where: { cartId: cart.cartId }
			});

			const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

			await transactionalEntityManager.update(Cart, cart.cartId, { totalItems });
		});
	}
}
