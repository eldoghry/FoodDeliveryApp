import HttpStatusCodes from 'http-status-codes';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';

export class AppController {
  async checkHealth(_req: Request, res: Response) {
    sendResponse(res, HttpStatusCodes.OK, 'OK');
  }
}
