import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { Cart, CartItem, CartRelations, Customer, Item, Menu } from '../models';
import { MenuRepository, CartRepository, CustomerRepository } from '../repositories';
import { AppDataSource } from '../config/data-source';
import { CartAddItemDto, CartItemResponse, CartResponse, FindCartItemFilter, RestaurantCart } from '../dtos/cart.dto';
import { EntityManager } from 'typeorm';

interface UpdateQuantityPayload {
	quantity: number;
}

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();
	private customerRepo = new CustomerRepository();
	private dataSource = AppDataSource; // to be used for typeorm transactions

	private async validateCustomer(userId: number): Promise<Customer | null> {
		const customer = await this.customerRepo.getCustomerByUserId(userId);
		if (!customer) throw new ApplicationError(ErrMessages.customer.CustomerNotFound, StatusCodes.NOT_FOUND);
		return customer;
	}

	private async validateCart(customerId: number): Promise<Cart> {
		const cart = await this.cartRepo.getCartByCustomerId(customerId);
		if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, HttpStatusCodes.NOT_FOUND);
		return cart;
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

	async deleteAllCartItems(cartId: number, manager?: EntityManager) {
		const deleted = await this.cartRepo.deleteAllCartItems(cartId, manager);
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
		const item = await this.menuRepo.getItemById({ itemId });

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

	private cartResponse(cart: Cart, restaurant: RestaurantCart | null, items: CartItemResponse[]): CartResponse {
		const totalItems = Cart.calculateTotalItems(items as any);
		const totalPrice = Cart.calculateTotalPrice(items as any);

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

	async viewCart(userId: number): Promise<CartResponse> {
		const customer = await this.validateCustomer(userId);
		const cart = await this.validateCart(customer!.customerId);
		const cartItems = await this.cartRepo.getCartItems(cart.cartId);
		const restaurant =
			cartItems.length > 0 ? { id: cartItems[0].restaurantId!, name: cartItems[0].restaurantName! } : null;
		const items = cartItems.map((item) => this.cartItemReturn(item));

		return this.cartResponse(cart, restaurant, items);
	}

	async updateCartItemQuantity(userId: number, cartItemId: number, payload: UpdateQuantityPayload): Promise<CartItem> {
		const { quantity } = payload;
		return await this.dataSource.transaction(async (manager) => {
			const customer = await this.validateCustomer(userId);
			await this.validateCart(customer!.customerId);

			const cartItem = await this.getCartItemOrFail({
				cartItemId
			});

			cartItem.updateQuantity(quantity);

			const updatedCartItem = await this.cartRepo.updateCartItem(cartItemId, cartItem, manager);
			if (!updatedCartItem) {
				throw new ApplicationError(ErrMessages.cart.FailedToUpdateCartItem, HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}
			return updatedCartItem;
		});
	}

	async deleteCartItem(userId: number, cartItemId: number): Promise<boolean> {
		return await this.dataSource.transaction(async (manager) => {
			const customer = await this.validateCustomer(userId);
			await this.validateCart(customer!.customerId);

			await this.getCartItemOrFail({ cartItemId });

			const deleted = await this.cartRepo.deleteCartItem(cartItemId, manager);
			if (!deleted) {
				throw new ApplicationError(ErrMessages.cart.FailedToDeleteCartItem, HttpStatusCodes.INTERNAL_SERVER_ERROR);
			}

			return deleted;
		});
	}

	async clearCart(customerId: number): Promise<boolean> {
		return await this.dataSource.transaction(async (manager) => {
			const customer = await this.validateCustomer(customerId);
			const cart = await this.validateCart(customer!.customerId);

			const deleted = await this.deleteAllCartItems(cart.cartId, manager);
			return deleted;
		});
	}

	async isItemInActiveMenuOfRestaurant(restaurantId: number, itemId: number) {
		const item = await this.dataSource
			.getRepository(Menu)
			.createQueryBuilder('menu')
			.leftJoinAndSelect('menu.categories', 'category')
			.leftJoinAndSelect('category.items', 'item')
			.where('item.itemId = :itemId', { itemId }) 
			.andWhere('menu.isActive = true')
			.andWhere('menu.restaurantId  = :restaurantId', { restaurantId })
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

	async getCartWithItems(filter: { cartId?: number; customerId?: number; restaurantId?: number }): Promise<Cart> {
		const cart = await this.cartRepo.getCartWithItems(filter);

		if (!cart) throw new ApplicationError(ErrMessages.cart.CartNotFound, HttpStatusCodes.NOT_FOUND);

		return cart;
	}

	async getAndValidateCart(customerId: number, restaurantId: number) {
		const cart = await this.getCartWithItems({ customerId , restaurantId });

		// * validate cart not empty and cart items belong to restaurant
		if (!cart.cartItems.length) throw new ApplicationError(ErrMessages.cart.CartIsEmpty, HttpStatusCodes.BAD_REQUEST);

		return cart;
	}
}
