
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';

export class CartService {
	async clearCart(cartId: number) {
		logger.info('clearing cart items', { cartId });

		await AppDataSource.transaction(async (transactionalEntityManager) => {
			const cart = await transactionalEntityManager.findOne(Cart, {
				where: { cartId },
				relations: ['items']
			});

			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			if (!cart.isActive) {
				throw new ApplicationError(ErrMessages.cart.CartNotActive, StatusCodes.BAD_REQUEST);
			}

			await transactionalEntityManager.remove(cart.items);
			await transactionalEntityManager.update(Cart, cart.cartId, { totalItems: 0 });
		});
	}

	async updateCartQuantities(cartId: number, cartItemId: number, quantity: number) 
	{
		logger.info('updating item qunatity', { cartId, cartItemId, quantity });
		
		await AppDataSource.transaction(async (transactionalEntityManager) => {
			const cart = await transactionalEntityManager.findOne(Cart, {
				where: { cartId },
				relations: ['items']
			});

			if (!cart) {
				throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
			}

			if (!cart.isActive) {
				throw new ApplicationError(ErrMessages.cart.CartNotActive, StatusCodes.BAD_REQUEST);
			}
			
			const item = cart.items.find(item => item.cartItemId === cartItemId);
			if(!item)
				throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);

			await transactionalEntityManager.update(CartItem, cartItemId, { quantity });
		});
	}
}