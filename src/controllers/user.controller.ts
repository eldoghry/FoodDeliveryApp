import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  async create(req: Request, res: Response) {
    const user = await this.userService.createUser({});
    sendResponse(res, HttpStatusCodes.OK, 'User created successfully', user);
  }

  async getAll(req: Request, res: Response) {
    const users = await this.userService.getAll();
    sendResponse(res, HttpStatusCodes.OK, 'List users', users);
  }
}
