import { NextFunction, Request, Response } from 'express';
import ApplicationError from '../errors/application.error';
import HttpStatusCodes from 'http-status-codes';
import ErrMessages from '../errors/error-messages';

export function NotFoundHandler(req: Request, res: Response, _next: NextFunction) {
  const message = `${req.method} ${req.path}`;
  throw new ApplicationError(ErrMessages.http.NotFound, HttpStatusCodes.NOT_FOUND);
}
