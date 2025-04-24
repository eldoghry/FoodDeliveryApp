import { NextFunction, Request, Response } from "express";

export class ErrorHandler {
  // constructor(loggerService) {} //todo use logger

  handleError(err: any, req: Request, res: Response, _next: NextFunction) {
    console.error(err?.stack);

    const statusCode = err?.status || 500;

    res.status(statusCode).json({
      message: err?.message ?? "Something went wrong",
      status: statusCode,
    });
  }
}
