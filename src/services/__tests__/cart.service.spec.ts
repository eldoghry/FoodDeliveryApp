import logger from '../../config/logger';
import { CartAddItemDto } from '../../dtos/cart.dto';
import { CartRepository, MenuRepository } from '../../repositories';
import { CartService } from '../cart.service';

// Mock dependencies
const mockCartRepo = {
	getCartByCustomerId: jest.fn(),
	createCart: jest.fn(),
	getCartById: jest.fn(),
	getCartItems: jest.fn(),
	getCartItem: jest.fn(),
	addCartItem: jest.fn(),
	updateCart: jest.fn(),
	deleteAllCartItems: jest.fn(),
	updateCartItem: jest.fn(),
	deleteCart: jest.fn(),
	getCartItemById: jest.fn(),
	deleteCartItem: jest.fn(),
	getCarts: jest.fn()
};

const mockMenuRepo = {
	getItemById: jest.fn()
};

jest.mock('../../repositories/cart.repository.ts', () => {
	return { CartRepository: jest.fn(() => mockCartRepo) };
});

jest.mock('../../repositories/menu.repository.ts', () => {
	return { MenuRepository: jest.fn(() => mockMenuRepo) };
});

jest.mock('../../config/logger.ts', () => ({
	info: jest.fn()
}));

// Sample data
const sampleCart = {
	cartId: 1,
	customerId: 1,
	restaurantId: 1,
	restaurant: { restaurantId: 1, name: 'restaurant', isActive: true, status: 'open' },
	createdAt: new Date(),
	updatedAt: new Date()
};
const sampleItem = { id: 1, price: 10, name: 'Pizza', isAvailable: true };
const sampleCartItem = {
	cartItemId: 1,
	cartId: 1,
	itemId: 1,
	quantity: 1,
	price: 10,
	discount: 0,
	totalPrice: 10,
	updateQuantity: jest.fn()
};

describe('CartService ', () => {
	let service: CartService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new CartService();
	});

	describe('AddItem', () => {
		it('should create a new cart if none exists', async () => {
			mockCartRepo.getCartByCustomerId.mockResolvedValueOnce(null);
			mockMenuRepo.getItemById.mockResolvedValueOnce(sampleItem);
			mockCartRepo.createCart.mockResolvedValueOnce(sampleCart);
			mockCartRepo.addCartItem.mockResolvedValueOnce({});
			mockCartRepo.getCartItem.mockResolvedValueOnce(null);

			const payload: CartAddItemDto = { customerId: 1, itemId: 1, quantity: 1, restaurantId: 1 };

			await expect(service.addItem(payload)).resolves.toBeUndefined();
			expect(mockCartRepo.createCart).toHaveBeenCalled();
			expect(mockCartRepo.addCartItem).toHaveBeenCalled();
		});
		it('should clear cart if restaurant changes', async () => {});
		it('should throw if item already exists', async () => {});
		it('should add item successfully', async () => {});
	});
});
