import { NextFunction, Request, Response } from "express";

export function unknownHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.status(404).json({
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
