import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';

export class UserController {
  constructor() {}
  async create(req: Request, res: Response) {
    const user = { name: 'Mohamed Magdy', email: 'moh.mag.ali@gmail.com' };
    sendResponse(res, 200, 'User created successfully', user);
  }
}
