import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { CartResponseDTO, ItemInCartDTO } from '../interfaces/cart.interfaces';
import { Cart, CartItem, Item } from '../models';
import { MenuRepository } from '../repositories';
import { CartRepository } from '../repositories/cart.repository';
import { AppDataSource } from '../config/data-source';
import { CartAddItemDto, FindCartItemFilter } from '../dtos/cart.dto';

interface UpdateQuantityPayload {
	quantity: number;
}

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	private validateCart(cart: Cart): void {
		if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, HttpStatusCodes.NOT_FOUND);

		if (!cart.restaurant) {
			throw new ApplicationError(ErrMessages.restaurant.RestaurantNotFound, HttpStatusCodes.NOT_FOUND);
		}

		if (!cart.restaurant.isActive) {
			throw new ApplicationError(`${cart.restaurant.name} is not active`, HttpStatusCodes.BAD_REQUEST);
		}

		if (cart.restaurant.status !== 'open') {
			throw new ApplicationError(`${cart.restaurant.name} is not open`, HttpStatusCodes.BAD_REQUEST);
		}
	}

	private validateCartItems(cartItems: ItemInCartDTO[]): void {
		for (const item of cartItems) {
			if (!item.isAvailable) {
				throw new ApplicationError(`${item.name} is not available`, HttpStatusCodes.BAD_REQUEST);
			}
		}
	}

	private formatCartItem(item: ItemInCartDTO): ItemInCartDTO {
		return {
			cartId: item.cartId,
			cartItemId: item.cartItemId,
			id: item.id,
			name: item.name,
			imagePath: item.imagePath,
			quantity: item.quantity,
			totalPriceBefore: item.totalPriceBefore,
			discount: item.discount,
			totalPrice: item.totalPrice
		};
	}

	private formatCartResponse(
		cart: Cart,
		items: ItemInCartDTO[],
		totalItems: number,
		totalPrice: string
	): CartResponseDTO {
		return {
			id: cart.cartId,
			customerId: cart.customerId,
			restaurant: {
				id: cart.restaurant.restaurantId,
				name: cart.restaurant.name
			},
			items,
			totalItems,
			totalPrice,
			createdAt: cart.createdAt,
			updatedAt: cart.updatedAt
		};
	}

	async viewCart(cartId: number): Promise<CartResponseDTO> {
		const cart = await this.cartRepo.getCartById(cartId);
		this.validateCart(cart!);

		const cartItems = await this.cartRepo.getCartItems(cartId);
		if (cartItems.length === 0) {
			throw new ApplicationError(ErrMessages.cart.CartIsEmpty, HttpStatusCodes.BAD_REQUEST);
		}

		this.validateCartItems(cartItems);

		const items = cartItems.map((item) => this.formatCartItem(item));
		const totalItems = items.reduce((total, item) => Number(total) + Number(item.quantity), 0);
		const totalPrice = items.reduce((total, item) => Number(total) + Number(item.totalPrice), 0);

		return this.formatCartResponse(cart!, items, totalItems, totalPrice.toFixed(2));
	}

	async updateCartItemQuantity(cartId: number, itemId: number, payload: UpdateQuantityPayload): Promise<CartItem> {
		const { quantity } = payload;

		const cart = await this.cartRepo.getCartById(cartId);

		this.validateCart(cart!);

		// const cartItem = await this.cartRepo.getCartItemById(cartItemId);
		// if (!cartItem) {
		// 	throw new ApplicationError(ErrMessages.cart.CartItemNotFound, HttpStatusCodes.NOT_FOUND);
		// }

		// if (cartItem.cartId !== cartId) {
		// 	throw new ApplicationError(ErrMessages.cart.CartItemDoesNotBelongToTheSpecifiedCart, HttpStatusCodes.BAD_REQUEST);
		// }

		// const menuItemResult = await this.menuRepo.getMenuItemById(cartItem.menuItemId);
		// const item = menuItemResult?.[0]?.item;

		// if (!item || !item.price) {
		// throw new ApplicationError(ErrMessages.item.ItemNotFound, HttpStatusCodes.BAD_REQUEST);
		// }

		const item = await this.getItemByIdOrFail(itemId);

		const cartItem = await this.getCartItemOrFail({
			cartId,
			itemId
		});

		cartItem.updateQuantity(quantity);

		// const itemPrice = item.price;
		// const cartItemPriceBefore = itemPrice * quantity;
		// const cartItemDiscount = cartItem.discount;
		// const cartItemPriceAfter = cartItemPriceBefore - cartItemDiscount;

		// const data = {
		// 	quantity,
		// 	price: cartItemPriceBefore,
		// 	discount: cartItemDiscount,
		// 	totalPrice: cartItemPriceAfter
		// };

		await this.cartRepo.updateCartItem(cartItem.cartItemId, cartItem);

		return cartItem;
	}

	async clearCart(cartId: number): Promise<Boolean> {
		const cart = await this.cartRepo.getCartById(cartId);

		this.validateCart(cart!);

		await this.cartRepo.deleteAllCartItems(cartId);

		await this.cartRepo.deleteCart(cartId);

		return true;
	}

	async deleteCartItem(cartId: number, cartItemId: number): Promise<Cart> {
		const cart = (await this.getCart(cartId)) as Cart;

		this.validateCart(cart!);

		const cartItem = await this.cartRepo.getCartItemById(cartItemId);

		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}

		await this.cartRepo.deleteCartItem(cartItemId);

		// const newCart = await this.cartRepo.updateCart(cartId, {
		// 	totalItems: cart!.totalItems - cartItem.quantity
		// });

		// if (!newCart) {
		// 	throw new ApplicationError(ErrMessages.cart.FailedToUpdateCart, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		// }

		// return newCart;

		return cart;
	}

	// For testing only
	async getAllCarts(): Promise<any> {
		return this.cartRepo.getCarts();
	}

	async addItem(payload: CartAddItemDto) {
		const { customerId, restaurantId, itemId, quantity } = payload;

		const item = await this.getItemByIdOrFail(itemId);

		// 1) get user cart or create new one
		let cart = await this.getCart(customerId);

		if (!cart) {
			logger.info(`Creating a new cart for customer #${customerId}`);
			cart = await this.createCart(customerId, restaurantId);
		}

		// 2) validate current cart belong to current restaurant
		if (cart.restaurantId !== restaurantId) {
			logger.info(`Clearing cart for customer# ${customerId} due to restaurant change to ${restaurantId}`);

			await this.deleteAllCartItems(cart.cartId);
			cart.restaurantId = restaurantId;
			cart = (await this.updateCart(cart.cartId, { restaurantId })) as Cart;
		}

		// validate item not exist before
		const isItemExistOnCart = await this.isItemExistOnCart(cart.cartId, itemId);

		if (isItemExistOnCart) throw new ApplicationError(ErrMessages.cart.CartItemAlreadyExist, StatusCodes.BAD_REQUEST);

		// create cart item and save it
		const cartItem = CartItem.buildCartItem({
			cartId: cart.cartId,
			itemId,
			quantity,
			price: item.price
		});

		await this.addCartItem(cartItem);

		logger.info(`Added new item #${itemId} to cart# ${cart?.cartId}`);

		return;
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
}
