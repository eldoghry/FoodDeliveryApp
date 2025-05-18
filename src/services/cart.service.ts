
import { CartRepository } from "../repositories/cart.repository";
import ApplicationError from "../errors/application.error";
import HttpStatusCodes from "http-status-codes";

export class CartService {
    private cartRepo = new CartRepository();

    async viewCart(cartId: number): Promise<any> {
        /* 
           check cart Id 
           check cart is active
           check resturant_id status & active 
           check customer_id active
           check cart items
           check menu item is still available 
           view discount for each cart item if exist
           view before & after discount price for each cart item
           calculate total price
       */
        const cart = await this.cartRepo.getCartById(cartId);
        if (!cart) throw new ApplicationError('Cart not found', HttpStatusCodes.NOT_FOUND);
        if (!cart.isActive) throw new ApplicationError('Cart is not active', HttpStatusCodes.BAD_REQUEST);

        if (!cart.restaurant) throw new ApplicationError('Restaurant not found', HttpStatusCodes.NOT_FOUND);
        if (!cart.restaurant.isActive) throw new ApplicationError(`${cart.restaurant.name} is not active`, HttpStatusCodes.BAD_REQUEST);
        if (cart.restaurant.status !== 'open') throw new ApplicationError(`${cart.restaurant.name} is not open`, HttpStatusCodes.BAD_REQUEST);

        const cartItems = await this.cartRepo.getCartItems(cartId);
        if (cartItems.length === 0) throw new ApplicationError('Cart is empty', HttpStatusCodes.BAD_REQUEST);

        cartItems.forEach((item) => {
            if (!item.is_available) throw new ApplicationError(`Item ${item.name} is not available`, HttpStatusCodes.BAD_REQUEST);
        });

        const totalPrice = cartItems.reduce((total, item) => total + item.total_price_after, 0);

        const items = cartItems.map((item) => {
            return {
                id: item.item_id,
                name: item.name,
                imagePath: item.image_path,
                quantity: item.quantity,
                totalPriceBefore: item.total_price_before,
                discount: item.discount,
                totalPriceAfter: item.total_price_after,
            };
        });
        return {
            cartId:cart.cartId,
            customerId:cart.customerId,
            restaurant:{
                id:cart.restaurant.restaurantId,
                name:cart.restaurant.name,
            },
            items:items,
            totalItems:cart.totalItems,
            totalPrice:totalPrice,
            isActive:cart.isActive,
            createdAt:cart.createdAt,
            updatedAt:cart.updatedAt
        };
    }

    // for test only
    async getAllCarts(): Promise<any> {
        return this.cartRepo.getCarts();
    }

}  