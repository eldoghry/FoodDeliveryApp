import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { AppDataSource } from '../config/data-source';
import { Cart, CartItem } from '../models';
import logger from '../config/logger';
import { CartRepository, MenuRepository } from '../repositories';

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	async removeItem(cartItemId: number) {
		logger.info(`Starting removal of cart item`, { cartItemId });

		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			logger.info(`Beginning transaction for cart item removal`, { cartItemId });

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

			logger.info(`Deleting cart item`, { cartItemId });
			await transactionalEntityManager.delete(CartItem, cartItemId);

			const cartItems = await transactionalEntityManager.find(CartItem, {
				where: { cartId: cart.cartId }
			});

			const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

			await transactionalEntityManager.update(Cart, cart.cartId, { totalItems });

			logger.info(`Successfully removed cart item and updated cart totals`, {
				cartItemId,
				cartId: cart.cartId,
				newTotalItems: totalItems
			});
		});
	}

	async validateCartItems(cart: Cart): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = [];

		if (!cart.items || cart.items.length === 0) {
			return { valid: false, errors: ['Cart is empty'] };
		}

		// Check each item's availability and price consistency
		for (const cartItem of cart.items) {
			const menuItem = await this.menuRepo.getItemById(cartItem.menuItemId);

			if (!menuItem) {
				errors.push(`Menu item with ID ${cartItem.menuItemId} not found`);
				continue;
			}

			// Check if the item is still available
			if (!menuItem.isAvailable) {
				errors.push(`Item "${menuItem.name}" is currently unavailable`);
			}

			// Verify price consistency (in case prices changed since adding to cart)
			if (menuItem.price !== cartItem.price) {
				errors.push(`Price for "${menuItem.name}" has changed. Please refresh your cart.`);
			}
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}
	async getActiveCartWithItems(customerId: number): Promise<Cart | null> {
		const cart = await this.cartRepo.getActiveCartByCustomerId(customerId);

		if (!cart) return null;

		if (!cart.items || cart.items.length === 0) {
			cart.items = await this.cartRepo.getCartItems(cart.cartId);
		}

		return cart;
	}

	async deactivateCart(cartId: number): Promise<void> {
		const cart = await this.cartRepo.getCartById(cartId);

		if (!cart) {
			throw new ApplicationError(ErrMessages.cart.CartNotFound, StatusCodes.NOT_FOUND);
		}

		await this.cartRepo.updateCart(cartId, { isActive: false });
	}
}
