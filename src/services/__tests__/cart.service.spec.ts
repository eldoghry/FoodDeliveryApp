import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../../errors/application.error';
import ErrMessages from '../../errors/error-messages';
import { CartRepository, MenuRepository } from '../../repositories';
import { CartService } from '../cart.service';
import { Cart, CartItem, Item } from '../../models';

jest.mock('../../repositories');
jest.mock('../../config/data-source', () => {
	return {
		AppDataSource: {
			getRepository: jest.fn().mockReturnValue({
				findOne: jest.fn(),
				createQueryBuilder: jest.fn(() => {
					return {
						innerJoin: jest.fn().mockReturnThis(),
						where: jest.fn().mockReturnThis(),
						andWhere: jest.fn().mockReturnThis(),
						getOne: jest.fn()
					};
				})
			})
		}
	};
});

const mockCartRepo = {
	getCartByCustomerId: jest.fn(),
	createCart: jest.fn(),
	getCartById: jest.fn(),
	getCartItems: jest.fn(),
	getCartItem: jest.fn(),
	getCartItemById: jest.fn(),
	addCartItem: jest.fn(),
	updateCartItem: jest.fn(),
	deleteCartItem: jest.fn(),
	deleteAllCartItems: jest.fn(),
	getCarts: jest.fn()
};

const mockMenuRepo = {
	getItemById: jest.fn()
};

const mockCart = { cartId: 1, customerId: 1, createdAt: new Date(), updatedAt: new Date() };
const mockItem = { itemId: 1, price: 10 };
const mockCartItem = {
	cartId: 1,
	cartItemId: 1,
	itemId: 1,
	restaurantId: 1,
	quantity: 1,
	price: 10,
	totalPrice: 10,
	isAvailable: true,
	itemName: 'Pizza',
	imagePath: 'pizza.jpg',
	updateQuantity: jest.fn(),
	buildCartItem: jest.fn()
};

const addItemToCartPayload = {
	customerId: 1,
	restaurantId: 1,
	itemId: 1,
	quantity: 1
};

describe('CartService', () => {
	let cartService: CartService;

	beforeEach(() => {
		(CartRepository as jest.Mock).mockImplementation(() => mockCartRepo);
		(MenuRepository as jest.Mock).mockImplementation(() => mockMenuRepo);
		cartService = new CartService();
		jest.clearAllMocks();
	});

	describe('addItemToCart', () => {
		it('should add item to new cart', async () => {
			mockMenuRepo.getItemById.mockResolvedValueOnce(mockItem);
			mockCartRepo.getCartByCustomerId.mockResolvedValueOnce(mockCart);
			jest.spyOn(cartService, 'getCurrentRestaurantOfCart').mockResolvedValueOnce(1); // return restaurant id
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(true); // return restaurant id
			mockCartRepo.getCartItem.mockResolvedValueOnce(null); // item not exist on cart
			mockCartRepo.addCartItem.mockResolvedValueOnce({});

			// spy
			const getItemByIdOrFailSpy = jest.spyOn(cartService, 'getItemByIdOrFail');
			const result = await cartService.addItemToCart(addItemToCartPayload);

			expect(getItemByIdOrFailSpy).toHaveBeenCalledWith(mockItem.itemId);
			expect(result).toBeUndefined();
		});

		it('should throw 404 item not exist ', async () => {
			mockMenuRepo.getItemById.mockResolvedValueOnce(null);
			await expect(cartService.addItemToCart(addItemToCartPayload)).rejects.toThrow(
				new ApplicationError(ErrMessages.item.ItemNotFound, StatusCodes.NOT_FOUND)
			);
		});

		it('should create new card if it not exist', async () => {
			mockMenuRepo.getItemById.mockResolvedValueOnce(mockItem);
			mockCartRepo.createCart.mockResolvedValueOnce(mockCart);
			mockCartRepo.getCartByCustomerId.mockResolvedValueOnce(null);
			jest.spyOn(cartService, 'getCurrentRestaurantOfCart').mockResolvedValueOnce(1); // return restaurant id
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(true); // return restaurant id
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(true); // return restaurant id
			mockCartRepo.getCartItem.mockResolvedValueOnce(null); // item not exist on cart
			mockCartRepo.addCartItem.mockResolvedValueOnce({});

			// Spy on createCart to allow Jest to track its calls
			const createCartSpy = jest.spyOn(cartService, 'createCart');
			const getCurrentRestaurantOfCartSpy = jest.spyOn(cartService, 'getCurrentRestaurantOfCart');

			const result = await cartService.addItemToCart(addItemToCartPayload);

			expect(createCartSpy).toHaveBeenCalledWith(addItemToCartPayload.customerId);
			expect(getCurrentRestaurantOfCartSpy).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('should throw if item not belong to active menu of restaurant', async () => {
			mockMenuRepo.getItemById.mockResolvedValueOnce(mockItem);
			mockCartRepo.getCartByCustomerId.mockResolvedValueOnce(mockCart);
			jest.spyOn(cartService, 'getCurrentRestaurantOfCart').mockResolvedValueOnce(1); // return restaurant id
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(false); // return restaurant id

			await expect(cartService.addItemToCart(addItemToCartPayload)).rejects.toThrow(
				new ApplicationError(ErrMessages.menu.ItemNotBelongToActiveMenu, StatusCodes.BAD_REQUEST)
			);
		});

		it('should clear cart if restaurant Id changed', async () => {
			const differentRestaurantId = 2;

			jest.spyOn(cartService, 'getItemByIdOrFail').mockResolvedValueOnce(mockItem as Item);
			jest.spyOn(cartService, 'getCart').mockResolvedValueOnce(mockCart as Cart);
			jest.spyOn(cartService, 'getCurrentRestaurantOfCart').mockResolvedValueOnce(1);
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(true); // return restaurant id
			mockCartRepo.deleteAllCartItems.mockResolvedValueOnce(true);

			const deleteAllCartItemsSpy = jest.spyOn(cartService, 'deleteAllCartItems');
			mockCartRepo.getCartItem.mockResolvedValueOnce(null); // item not exist on cart
			mockCartRepo.addCartItem.mockResolvedValueOnce({});

			// spy
			const getItemByIdOrFailSpy = jest.spyOn(cartService, 'getItemByIdOrFail');

			const result = await cartService.addItemToCart({ ...addItemToCartPayload, restaurantId: differentRestaurantId });

			expect(deleteAllCartItemsSpy).toHaveBeenCalledWith(mockCart.cartId);
			expect(getItemByIdOrFailSpy).toHaveBeenCalledWith(mockItem.itemId);
			expect(result).toBeUndefined();
		});

		it('should throw if item already exist on current cart', async () => {
			mockMenuRepo.getItemById.mockResolvedValueOnce(mockItem);
			mockCartRepo.getCartByCustomerId.mockResolvedValueOnce(mockCart);
			jest.spyOn(cartService, 'getCurrentRestaurantOfCart').mockResolvedValueOnce(1); // return restaurant id
			jest.spyOn(cartService, 'isItemInActiveMenuOfRestaurant').mockResolvedValueOnce(true); // return restaurant id
			jest.spyOn(cartService, 'isItemExistOnCart').mockResolvedValueOnce(true);

			await expect(cartService.addItemToCart(addItemToCartPayload)).rejects.toThrow(
				new ApplicationError(ErrMessages.cart.CartItemAlreadyExistOnCart, StatusCodes.BAD_REQUEST)
			);
		});
	});
});
