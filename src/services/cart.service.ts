import { CartRepository } from '../repositories/cart.repository';
import ApplicationError from '../errors/application.error';
import HttpStatusCodes from 'http-status-codes';
import { Cart, CartItem } from '../models';
import { MenuRepository } from '../repositories';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ErrMessages from '../errors/error-messages';
import { CartResponseDTO, ItemInCartDTO } from '../interfaces/cart.interfaces';



interface UpdateQuantityPayload {
	quantity: number;
}

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();


	private validateCart(cart: Cart): void {
		if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, HttpStatusCodes.NOT_FOUND);
		if (!cart.isActive) throw new ApplicationError(ErrMessages.cart.CartIsNotActive, HttpStatusCodes.BAD_REQUEST);

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
			totalPriceAfter: item.totalPriceAfter
		};
	}

	private formatCartResponse(cart: Cart, items: ItemInCartDTO[], totalItems: number, totalPrice: string): CartResponseDTO {
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
			isActive: cart.isActive,
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
		const totalPrice = items.reduce((total, item) => Number(total) + Number(item.totalPriceAfter), 0);

		return this.formatCartResponse(cart!, items, totalItems, totalPrice.toFixed(2));
	}

	async updateCartItemQuantity(cartId: number, cartItemId: number, payload: UpdateQuantityPayload): Promise<CartItem> {
		const { quantity } = payload;

		const cart = await this.cartRepo.getCartById(cartId);

		this.validateCart(cart!);

		const cartItem = await this.cartRepo.getCartItemById(cartItemId);
		if (!cartItem) {
			throw new ApplicationError(ErrMessages.cart.CartItemNotFound, HttpStatusCodes.NOT_FOUND);
		}

		if (cartItem.cartId !== cartId) {
			throw new ApplicationError(ErrMessages.cart.CartItemDoesNotBelongToTheSpecifiedCart, HttpStatusCodes.BAD_REQUEST);
		}

		const menuItemResult = await this.menuRepo.getMenuItemById(cartItem.menuItemId);
		const item = menuItemResult?.[0]?.item;

		if (!item || !item.price) {
			throw new ApplicationError(ErrMessages.item.ItemNotFound, HttpStatusCodes.BAD_REQUEST);
		}
		const itemPrice = item.price;
		const cartItemPriceBefore = itemPrice * quantity;
		const cartItemDiscount = cartItem.discount;
		const cartItemPriceAfter = cartItemPriceBefore - cartItemDiscount;

		const data = {
			quantity,
			price: cartItemPriceBefore,
			discount: cartItemDiscount,
			totalPrice: cartItemPriceAfter
		};

		const updatedItem = await this.cartRepo.updateCartItem(cartItemId, data);
		if (!updatedItem) {
			throw new ApplicationError(ErrMessages.cart.FailedToUpdateCartItem, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}
		return updatedItem;
	}

	// For testing only
	async getAllCarts(): Promise<any> {
		return this.cartRepo.getCarts();
	}


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