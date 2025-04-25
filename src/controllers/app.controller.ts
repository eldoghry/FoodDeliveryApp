import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';

export class AppController {
  checkHealth(_req: Request, res: Response) {
    sendResponse(res, 200, 'OK');
  }
}
