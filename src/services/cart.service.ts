import { CartRepository } from "../repositories/cart.repository";
import ApplicationError from "../errors/application.error";
import HttpStatusCodes from "http-status-codes";

export class CartService {
    private cartRepo = new CartRepository();

    private validateCart(cart: any): void {
        if (!cart) throw new ApplicationError("Cart not found", HttpStatusCodes.NOT_FOUND);
        if (!cart.isActive) throw new ApplicationError("Cart is not active", HttpStatusCodes.BAD_REQUEST);

        if (!cart.restaurant) {
            throw new ApplicationError("Restaurant not found", HttpStatusCodes.NOT_FOUND);
        }

        if (!cart.restaurant.isActive) {
            throw new ApplicationError(`${cart.restaurant.name} is not active`, HttpStatusCodes.BAD_REQUEST);
        }

        if (cart.restaurant.status !== "open") {
            throw new ApplicationError(`${cart.restaurant.name} is not open`, HttpStatusCodes.BAD_REQUEST);
        }
    }

    private validateCartItems(cartItems: any[]): void {
        for (const item of cartItems) {
            if (!item.is_available) {
                throw new ApplicationError(`Item ${item.name} is not available`, HttpStatusCodes.BAD_REQUEST);
            }
        }
    }

    private formatCartItem(item: any): any {
        return {
            id: item.item_id,
            name: item.name,
            imagePath: item.image_path,
            quantity: item.quantity,
            totalPriceBefore: item.total_price_before,
            discount: item.discount,
            totalPriceAfter: item.total_price_after,
        };
    }

    private formatCartResponse(cart: any, items: any[], totalPrice: string): any {
        return {
            cartId: cart.cartId,
            customerId: cart.customerId,
            restaurant: {
                id: cart.restaurant.restaurantId,
                name: cart.restaurant.name,
            },
            items,
            totalItems: cart.totalItems,
            totalPrice,
            isActive: cart.isActive,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }

    async viewCart(cartId: number): Promise<any> {
        const cart = await this.cartRepo.getCartById(cartId);
        this.validateCart(cart);

        const cartItems = await this.cartRepo.getCartItems(cartId);
        if (cartItems.length === 0) {
            throw new ApplicationError("Cart is empty", HttpStatusCodes.BAD_REQUEST);
        }

        this.validateCartItems(cartItems);

        const items = cartItems.map((item) => this.formatCartItem(item));
        const totalPrice = items.reduce((total, item) => Number(total) + Number(item.totalPriceAfter), 0);

        return this.formatCartResponse(cart, items, totalPrice.toFixed(2));
    }



    // For testing only
    async getAllCarts(): Promise<any> {
        return this.cartRepo.getCarts();
    }
}
