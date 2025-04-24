import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { sendResponse } from '../utils/sendResponse';

export function ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err?.status || 500;

  logger.error(err.message, err);

  sendResponse(res, statusCode, err?.message ?? 'Something went wrong');
}
