import { AppDataSource } from '../config/data-source';
import { Cart } from '../models/cart/cart.entity';
import { CartItem } from '../models/cart/cart-item.entity';
import { Repository } from 'typeorm';

export class CartRepository {
	private cartRepo: Repository<Cart>;
	private cartItemRepo: Repository<CartItem>;

	constructor() {
		this.cartRepo = AppDataSource.getRepository(Cart);
		this.cartItemRepo = AppDataSource.getRepository(CartItem);
	}

	// Cart operations
	async createCart(data: Partial<Cart>): Promise<Cart> {
		const cart = this.cartRepo.create(data);
		return await this.cartRepo.save(cart);
	}

	async getCartById(cartId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { cartId },
			relations: ['customer', 'restaurant']
		});
	}

	async getCarts(): Promise<Cart[] | null> {
		return await this.cartRepo.find();
	}
	async getCartByCustomerId(customerId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { customerId },
			relations: ['customer', 'restaurant']
		});
	}

	async updateCart(cartId: number, data: Partial<Cart>): Promise<Cart | null> {
		await this.cartRepo.update(cartId, data);
		return await this.getCartById(cartId);
	}

	async deleteCart(cartId: number): Promise<void> {
		await this.cartRepo.delete(cartId);
	}

	// Cart Item operations
	async addCartItem(data: Partial<CartItem>): Promise<CartItem> {
		const cartItem = this.cartItemRepo.create(data);
		return await this.cartItemRepo.save(cartItem);
	}

	// async getCartItems(cartId: number): Promise<CartItem[]> {
	// 	return await this.cartItemRepo.find({
	// 		where: { cartId },
	// 		relations: ['menuItem.item']
	// 	}); 
	// }

	async getCartItems(cartId: number): Promise<any[]> {
		return await this.cartItemRepo.createQueryBuilder('ci')
			.select([
				'ci.quantity as quantity',
				'ci.price as total_price_before',
				'ci.discount as discount',
				'ci.totalPrice as total_price_after',
				'i.itemId as item_id',
				'i.name as name',
				'i.imagePath as image_path',
				'i.isAvailable as is_available'
			])
			.innerJoin('ci.menuItem', 'mi')
			.innerJoin('mi.item', 'i')
			.where('ci.cartId = :cartId', { cartId })
			.getRawMany();
	}


	async getCartItem(cartItemId: number): Promise<CartItem | null> {
		return await this.cartItemRepo.findOne({
			where: { cartItemId },
			relations: ['menuItem']
		});
	}

	async updateCartItem(cartItemId: number, data: Partial<CartItem>): Promise<CartItem | null> {
		await this.cartItemRepo.update(cartItemId, data);
		return await this.getCartItem(cartItemId);
	}

	async deleteCartItem(cartItemId: number): Promise<void> {
		await this.cartItemRepo.delete(cartItemId);
	}

	async deleteAllCartItems(cartId: number): Promise<void> {
		await this.cartItemRepo.delete({ cartId });
	}

	// Helper methods
	// async calculateCartTotal(cartId: number): Promise<number> {
	// 	const cartItems = await this.getCartItems(cartId);
	// 	return cartItems.reduce((total, item) => total + item.totalPrice, 0);
	// }

	// async updateCartTotalItems(cartId: number): Promise<void> {
	// 	const cartItems = await this.getCartItems(cartId);
	// 	const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
	// 	await this.updateCart(cartId, { totalItems });
	// }

	// async getCartDetails(cartId: number): Promise<Cart | null> {

	// }
}
