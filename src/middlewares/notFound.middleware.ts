import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';

export function NotFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  sendResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
