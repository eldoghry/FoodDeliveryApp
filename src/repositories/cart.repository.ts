import { AppDataSource } from '../config/data-source';
import { Cart } from '../models/cart/cart.entity';
import { CartItem } from '../models/cart/cart-item.entity';
import { EntityManager, Repository } from 'typeorm';
import { CartItemResponse } from '../dtos/cart.dto';

export class CartRepository {
	private cartRepo: Repository<Cart>;
	private cartItemRepo: Repository<CartItem>;
	

	constructor() {
		this.cartRepo = AppDataSource.getRepository(Cart);
		this.cartItemRepo = AppDataSource.getRepository(CartItem);
	}

	private getCartItemRepo(manager?: EntityManager): Repository<CartItem> {
		return manager ? manager.getRepository(CartItem) : this.cartItemRepo;
	}
	
	
	// Cart operations
	async createCart(data: Partial<Cart>): Promise<Cart> {
		const cart = this.cartRepo.create(data);
		return await this.cartRepo.save(cart);
	}

	async getCartById(cartId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { cartId },
			relations: ['customer']
		});
	}

	async getCarts(): Promise<Cart[] | null> {
		return await this.cartRepo.find();
	}
	async getCartByCustomerId(customerId: number): Promise<Cart | null> {
		return await this.cartRepo.findOne({
			where: { customerId },
			relations: ['customer']
		});
	}

	async updateCart(cartId: number, data: Partial<Cart>): Promise<Cart | null> {
		await this.cartRepo.update({ cartId }, data);
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

	async getCartItems(cartId: number): Promise<CartItemResponse[]> {
		return await this.cartItemRepo
			.createQueryBuilder('ci')
			.select([
				'ci.cart_id AS "cartId"',
				'ci.cart_item_id AS "cartItemId"',
				'ci.quantity AS "quantity"',
				'ci.price AS "price"',
				'ci.total_price AS "totalPrice"',
				'r.restaurant_id AS "restaurantId"',
				'r.name AS "restaurantName"',
				'i.item_id AS "itemId"',
				'i.name AS "itemName"',
				'i.image_path AS "imagePath"',
				'i.is_available AS "isAvailable"'
			  ])
			.innerJoin('ci.restaurant', 'r')
			.innerJoin('ci.item', 'i')
			.where('ci.cart_id = :cartId', { cartId })
			.getRawMany();
	}

	async getCartItemById(cartItemId: number): Promise<CartItem | null> {
		return await this.cartItemRepo.findOneBy({ cartItemId });
	}

	async getCartItem(filter: { cartId?: number; itemId?: number; cartItemId?: number }): Promise<CartItem | null> {
		if (!Object.keys(filter).length) return null;

		const cartItem = await this.cartItemRepo.findOne({
			where: { ...filter },
			// relations: ['item']
		});

		return cartItem || null;
	}

	// async updateCartItem(cartItemId: number, data: Partial<CartItem>): Promise<CartItem | null> {
	// 	await this.cartItemRepo.update(cartItemId, data);
	// 	return await this.getCartItemById(cartItemId);
	// }

	async updateCartItem(
		cartItemId: number,
		data: Partial<CartItem>,
		manager?: EntityManager
	  ): Promise<CartItem | null> {
		const repo = this.getCartItemRepo(manager);
	  
		await repo.update(cartItemId, data);
		return await repo.findOneBy({ cartItemId });
	  }
	  

	async deleteCartItem(cartItemId: number,manager?: EntityManager): Promise<boolean> {
		const repo = this.getCartItemRepo(manager); 
		const result = await repo.delete(cartItemId);
		return result.affected ? true : false;
	}

	async deleteAllCartItems(cartId: number,manager?: EntityManager): Promise<boolean> {
		const repo = this.getCartItemRepo(manager); 
		const result = await repo.delete({ cartId });
		return result.affected ? true : false; 
	}
}
