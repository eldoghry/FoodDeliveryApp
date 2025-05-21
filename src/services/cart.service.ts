import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { Cart, CartItem, Item, MenuItem } from '../models';
import { MenuRepository, CartRepository } from '../repositories';
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

	async addItemToCart(payload: CartAddItemDto) {
		const { customerId, restaurantId, itemId, quantity } = payload;

		// Step 1: Validate the item exists
		const item = await this.getItemByIdOrFail(itemId);

		// Step 2: Get or create the cart
		let cart = (await this.getCart(customerId)) as Cart;
		let isNewCart = !cart;

		if (isNewCart) {
			logger.info(`Creating a new cart for customer# ${customerId}`);
			cart = await this.createCart(customerId);
		}

		// Step 3: Determine the current restaurant associated with the cart
		let cartRestaurantId = isNewCart ? restaurantId : await this.getCurrentRestaurantOfCart(cart.cartId);
		if (!cartRestaurantId) cartRestaurantId = restaurantId;

		logger.info(`Cart current restaurant id# ${cartRestaurantId}`);

		// Step 4: Validate that the item belongs to an active menu for the given restaurant
		const itemBelongsToRestaurant = await this.isItemInActiveMenuOfRestaurant(restaurantId, itemId);

		if (!itemBelongsToRestaurant)
			throw new ApplicationError(ErrMessages.menu.ItemNotBelongToActiveMenu, StatusCodes.BAD_REQUEST);

		// Step 5: If switching restaurants, clear the cart
		if (!isNewCart && cartRestaurantId !== restaurantId) {
			logger.info(`Clearing cart for customer# ${customerId} due to restaurant change to ${restaurantId}`);
			await this.deleteAllCartItems(cart.cartId);
		}

		// Step 6: Prevent duplicate item in cart
		const itemAlreadyInCart = await this.isItemExistOnCart(cart.cartId, itemId);

		if (itemAlreadyInCart)
			throw new ApplicationError(ErrMessages.cart.CartItemAlreadyExistOnCart, StatusCodes.BAD_REQUEST);

		// Step 7: Create and add the new item to cart
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

	private cartResponse(cart: Cart, items: CartItemResponse[]): CartResponse {
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

	async isItemInActiveMenuOfRestaurant(restaurantId: number, itemId: number) {
		const item = await this.dataSource
			.getRepository(MenuItem)
			.createQueryBuilder('menuItem')
			.innerJoin('menuItem.menu', 'menu', 'menuItem.menuId = menu.menuId')
			.innerJoin('menu.restaurant', 'restaurant', 'menu.restaurantId = restaurant.restaurantId')
			.where('menuItem.itemId = :itemId', { itemId })
			.andWhere('menu.isActive = true')
			.andWhere('restaurant.restaurantId  = :restaurantId', { restaurantId })
			// .andWhere('restaurant.isActive = true')
			.getOne();

		return item != null;
	}

	async getCurrentRestaurantOfCart(cartId: number) {
		const cartItems = await this.dataSource.getRepository(CartItem).findOne({
			where: { cartId },
			order: {
				cartItemId: 'ASC'
			}
		});

		if (cartItems) return cartItems.restaurantId;

		return null;
	}
}
