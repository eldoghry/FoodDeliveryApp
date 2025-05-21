import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CartResponseDTO, ItemInCartDTO } from '../interfaces/cart.interfaces';
import { Cart, CartItem, Item, Transaction } from '../models';
import { MenuRepository } from '../repositories';
import { CartRepository } from '../repositories/cart.repository';
import { AppDataSource } from '../config/data-source';
import { CartAddItemDto, CartItemResponse, CartResponse, FindCartItemFilter } from '../dtos/cart.dto';

interface UpdateQuantityPayload {
	quantity: number;
}

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	private async validateCart(cartId: number): Promise<void> {
		const cart = await this.cartRepo.getCartById(cartId);
		if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, HttpStatusCodes.NOT_FOUND);
	}

	async getCart(customerId: number) {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		return cart;
	}

	async createCart(customerId: number) {
		const newCart = new Cart();
		newCart.customerId = customerId;
		return this.cartRepo.createCart(newCart);
	}

	// async getCartItems(cartId: number) {
	// 	return this.cartRepo.getCartItems(cartId);
	// }

	// async addCartItem(cartItem: Partial<CartItem>) {
	// 	return this.cartRepo.addCartItem(cartItem);
	// }

	// async updateCartItem(cartItemId: number, cartItem: Partial<CartItem>) {
	// 	return this.cartRepo.updateCartItem(cartItemId, cartItem);
	// }

	// async updateCart(cartId: number, cart: Partial<Cart>) {
	// 	return this.cartRepo.updateCart(cartId, cart);
	// }

	async deleteAllCartItems(cartId: number) {
		const deleted = await this.cartRepo.deleteAllCartItems(cartId);
		if (!deleted) {
			throw new ApplicationError(ErrMessages.cart.FailedToClearCart, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}
		return deleted;
	}

	/**
	 * Get Item by id or through not found error
	 * @param itemId
	 * @returns
	 */
	async getItemByIdOrFail(itemId: number): Promise<Item> {
		const item = await this.menuRepo.getItemById(itemId);

		if (!item) throw new ApplicationError(ErrMessages.item.ItemNotFound, StatusCodes.NOT_FOUND);

		return item;
	}

	async getCartItemOrFail(filter: FindCartItemFilter) {
		const cartItem = await this.cartRepo.getCartItem(filter);

		if (!cartItem) throw new ApplicationError(ErrMessages.cart.CartItemNotFound, StatusCodes.NOT_FOUND);

		return cartItem;
	}

	async isItemExistOnCart(cartId: number, itemId: number) {
		const isItemExistOnCart = await this.cartRepo.getCartItem({ cartId, itemId });
		return isItemExistOnCart !== null;
	}



	async addItem(payload: CartAddItemDto) {
		const { customerId, restaurantId, itemId, quantity } = payload;

		const item = await this.getItemByIdOrFail(itemId);

		// 1) get user cart or create new one
		let cart = await this.getCart(customerId);

		if (!cart) {
			logger.info(`Creating a new cart for customer #${customerId}`);
			cart = await this.createCart(customerId);
		}

		// 2) validate current cart belong to current restaurant
		// if (cart.restaurantId !== restaurantId) {
		// 	logger.info(`Clearing cart for customer# ${customerId} due to restaurant change to ${restaurantId}`);

		// 	await this.deleteAllCartItems(cart.cartId);
		// 	cart.restaurantId = restaurantId;
		// 	cart = (await this.updateCart(cart.cartId, { restaurantId })) as Cart;
		// }

		// validate item not exist before
		// const isItemExistOnCart = await this.isItemExistOnCart(cart.cartId, itemId);

		// if (isItemExistOnCart) throw new ApplicationError(ErrMessages.cart.CartItemAlreadyExist, StatusCodes.BAD_REQUEST);

		// create cart item and save it

		const cartItem = CartItem.buildCartItem({
			cartId: cart.cartId,
			restaurantId,
			itemId,
			quantity,
			price: item.price
		});

		await this.cartRepo.addCartItem(cartItem);

		logger.info(`Added new item #${itemId} to cart# ${cart?.cartId}`);

		return;
	}


	private cartItemReturn(item: CartItemResponse) {
		return {
			cartId: item.cartId,
			cartItemId: item.cartItemId,
			itemId: item.itemId,
			itemName: item.itemName,
			imagePath: item.imagePath,
			quantity: item.quantity,
			price: item.price,
			totalPrice: item.totalPrice,
			isAvailable: item.isAvailable
		};
	}

	private cartResponse(
		cart: Cart,
		items: CartItemResponse[],
	): CartResponse {
		const restaurant = { id: items[0].restaurantId!, name: items[0].restaurantName! };
		const totalItems = items.reduce((total, item) => Number(total) + Number(item.quantity), 0);
		const totalPrice = items.reduce((total, item) => Number(total) + Number(item.totalPrice), 0);
		return {
			id: cart.cartId,
			customerId: cart.customerId,
			restaurant,
			items,
			totalItems,
			totalPrice: totalPrice.toFixed(2),
			createdAt: cart.createdAt,
			updatedAt: cart.updatedAt
		};
	}

	async viewCart(cartId: number): Promise<CartResponse> {
		await this.validateCart(cartId);

		const cart = await this.cartRepo.getCartById(cartId);
		const cartItems = await this.cartRepo.getCartItems(cartId);

		const items = cartItems.map((item) => this.cartItemReturn(item));
		return this.cartResponse(cart!, items);
	}

	async updateCartItemQuantity(cartId: number, cartItemId: number, payload: UpdateQuantityPayload): Promise<CartItem> {
		const { quantity } = payload;

		await this.validateCart(cartId);

		const cartItem = await this.getCartItemOrFail({
			cartItemId
		});

		cartItem.updateQuantity(quantity);

		await this.cartRepo.updateCartItem(cartItem.cartItemId, cartItem);

		return cartItem;
	}


	async deleteCartItem(cartId: number, cartItemId: number): Promise<boolean> {
		await this.validateCart(cartId);

		const cartItem = await this.cartRepo.getCartItemById(cartItemId);

		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}

		const deleted = await this.cartRepo.deleteCartItem(cartItemId);
		if (!deleted) {
			throw new ApplicationError(ErrMessages.cart.FailedToDeleteCartItem, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}

		return deleted;
	}

	async clearCart(cartId: number): Promise<boolean> {
		await this.validateCart(cartId);

		const deleted = await this.deleteAllCartItems(cartId);
		return deleted;
	}

	// For testing only
	async getAllCarts(): Promise<any> {
		return this.cartRepo.getCarts();
	}

}
