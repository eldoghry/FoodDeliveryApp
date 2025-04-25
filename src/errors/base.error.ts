import { HttpStatusCodes } from '../enums';

export default class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly data?: any;

  constructor(
    message: string,
    statusCode: number = HttpStatusCodes.InternalServerError,
    isOperational: boolean = true,
    data?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;

    Error.captureStackTrace(this);
  }
}
