import { StatusCodes } from 'http-status-codes';
import { Cart, CartItem } from '../models';
import { CartRepository } from '../repositories/cart.repository';
import logger from '../config/logger';
import { MenuRepository } from '../repositories';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();

	async addItem(payload: { customerId: number; restaurantId: number; itemId: number; quantity: number }) {
		const { customerId, restaurantId, itemId, quantity } = payload;

		const item = await this.menuRepo.getItemById(itemId);

		if (!item) throw new ApplicationError(ErrMessages.item.ItemNotFound, StatusCodes.NOT_FOUND);

		// 1) get user cart or create new one
		let cart = await this.getCart(customerId);
		if (!cart) {
			logger.info(`Creating a new cart for customer #${customerId}`);
			cart = await this.createCart(customerId, restaurantId);
		}

		// 2) validate current cart belong to current restaurant
		if (cart.restaurantId !== restaurantId) {
			logger.info(`Clearing cart for customer #${customerId} due to restaurant change`);

			await this.deleteAllCartItems(cart.cartId);
			cart = (await this.updateCart(cart.cartId, {
				restaurantId,
				totalItems: 0
			})) as Cart;
		}

		// update total items on cart
		await this.handleCartItem(cart.cartId, item.itemId, quantity, item.price);
		cart.totalItems += quantity;
		cart = (await this.updateCart(cart.cartId, cart)) as Cart;

		return cart;
	}

	async getCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		return cart;
	}

	async createCart(customerId: number, restaurantId: number) {
		const newCart = new Cart();
		newCart.customerId = customerId;
		newCart.restaurantId = restaurantId;
		return this.cartRepo.createCart(newCart);
	}

	async getCartItems(cartId: number) {
		return this.cartRepo.getCartItems(cartId);
	}

	async addCartItem(cartItem: Partial<CartItem>) {
		return this.cartRepo.addCartItem(cartItem);
	}

	async updateCartItem(cartItemId: number, cartItem: Partial<CartItem>) {
		return this.cartRepo.updateCartItem(cartItemId, cartItem);
	}

	async updateCart(cartId: number, cart: Partial<Cart>) {
		return this.cartRepo.updateCart(cartId, cart);
	}

	async deleteAllCartItems(cartId: number) {
		return this.cartRepo.deleteAllCartItems(cartId);
	}

	async handleCartItem(cartId: number, itemId: number, quantity: number, price: number) {
		const cartItems = await this.getCartItems(cartId);
		const existingCartItem = cartItems.find((ci) => ci.itemId === itemId);

		if (existingCartItem) {
			const { price, discount } = existingCartItem!;
			existingCartItem!.quantity += quantity;
			existingCartItem!.totalPrice = (price - discount) * existingCartItem!.quantity; // you can make it by database
			await this.updateCartItem(existingCartItem!.cartItemId, existingCartItem!);
			logger.info('Updated existing cart item', existingCartItem.cartItemId);
		} else {
			// add new cart item
			const cartItem = new CartItem();
			cartItem.cartId = cartId;
			cartItem.itemId = itemId;
			cartItem.quantity = quantity;
			cartItem.discount = 0;
			cartItem.price = price;
			cartItem.totalPrice = (price - cartItem.discount) * cartItem.quantity;

			await this.addCartItem(cartItem);
			logger.info(`Added new item #${itemId} to cart# ${cartId}`);
		}
	}
}
