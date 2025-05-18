import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';

export class CartController {
    private cartService = new CartService();

  async viewCart(req:Request,res:Response){
    const {cartId} = req.validated?.params;
    const cart = await this.cartService.viewCart(Number(cartId));
    sendResponse(res,HttpStatusCodes.OK,'Cart details',cart);
  }

  // for test only
  async getAllCarts(req:Request,res:Response){
    const carts = await this.cartService.getAllCarts();
    sendResponse(res,HttpStatusCodes.OK,'Carts',carts);
  }
}
