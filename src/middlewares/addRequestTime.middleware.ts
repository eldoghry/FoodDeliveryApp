import { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    requestAt: Date;
  }
}

export const addRequestTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestAt = new Date();
  next();
};
