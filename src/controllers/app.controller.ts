import HttpStatusCodes from 'http-status-codes';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import logger from '../config/logger';

export class AppController {
  async checkHealth(_req: Request, res: Response) {
    await logger.info({ status: 'ok' });
    sendResponse(res, HttpStatusCodes.OK, 'OK');
  }
}
