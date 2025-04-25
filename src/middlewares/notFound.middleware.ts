import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import NotFoundError from '../errors/not-found.error';

export function NotFoundHandler(req: Request, res: Response, _next: NextFunction) {
  const message = `${req.method} ${req.path}`;
  throw new NotFoundError(message);
}
