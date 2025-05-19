import { CartRepository } from '../repositories/cart.repository';
import ApplicationError from '../errors/application.error';
import HttpStatusCodes from 'http-status-codes';
import { Cart, CartItem } from '../models';
import { MenuRepository } from '../repositories';

interface ItemDTO {
	cart_id: number;
	cart_item_id: number;
	item_id: number;
	name: string;
	image_path: string;
	quantity: number;
	total_price_before: string;
	discount: string;
	total_price_after: string;
}

interface UpdateQuantityPayload {
	quantity: number;
}

export class CartService {
	private cartRepo = new CartRepository();
	private menuRepo = new MenuRepository();

	private validateCart(cart: Cart): void {
		if (!cart) throw new ApplicationError('Cart not found', HttpStatusCodes.NOT_FOUND);
		if (!cart.isActive) throw new ApplicationError('Cart is not active', HttpStatusCodes.BAD_REQUEST);

		if (!cart.restaurant) {
			throw new ApplicationError('Restaurant not found', HttpStatusCodes.NOT_FOUND);
		}

		if (!cart.restaurant.isActive) {
			throw new ApplicationError(`${cart.restaurant.name} is not active`, HttpStatusCodes.BAD_REQUEST);
		}

		if (cart.restaurant.status !== 'open') {
			throw new ApplicationError(`${cart.restaurant.name} is not open`, HttpStatusCodes.BAD_REQUEST);
		}
	}

	private validateCartItem(cartId: number, cartItem: CartItem): void {
		if (!cartItem) throw new ApplicationError('Cart item not found', HttpStatusCodes.NOT_FOUND);
		if (cartItem.cartId !== cartId) {
			throw new ApplicationError('Cart item does not belong to the specified cart', HttpStatusCodes.BAD_REQUEST);
		}
	}

	private validateCartItems(cartItems: any[]): void {
		for (const item of cartItems) {
			if (!item.is_available) {
				throw new ApplicationError(`Item ${item.name} is not available`, HttpStatusCodes.BAD_REQUEST);
			}
		}
	}

	private formatCartItem(item: ItemDTO): any {
		return {
			cartId: item.cart_id,
			cartItemId: item.cart_item_id,
			id: item.item_id,
			name: item.name,
			imagePath: item.image_path,
			quantity: item.quantity,
			totalPriceBefore: item.total_price_before,
			discount: item.discount,
			totalPriceAfter: item.total_price_after
		};
	}

	private formatCartResponse(cart: Cart, items: ItemDTO[], totalItems: number, totalPrice: string): any {
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

	async viewCart(cartId: number): Promise<any> {
		const cart = await this.cartRepo.getCartById(cartId);
		this.validateCart(cart!);

		const cartItems = await this.cartRepo.getCartItems(cartId);
		if (cartItems.length === 0) {
			throw new ApplicationError('Cart is empty', HttpStatusCodes.BAD_REQUEST);
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
			throw new ApplicationError('Cart item not found', HttpStatusCodes.NOT_FOUND);
		}

		if (cartItem.cartId !== cartId) {
			throw new ApplicationError('Cart item does not belong to the specified cart', HttpStatusCodes.BAD_REQUEST);
		}

		const menuItemResult = await this.menuRepo.getMenuItemById(cartItem.menuItemId);
		const item = menuItemResult?.[0]?.item;

		if (!item || !item.price) {
			throw new ApplicationError('Item price not found', HttpStatusCodes.BAD_REQUEST);
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
			throw new ApplicationError('Failed to update cart item', HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}
		return updatedItem;
	}

	// For testing only
	async getAllCarts(): Promise<any> {
		return this.cartRepo.getCarts();
	}
}
