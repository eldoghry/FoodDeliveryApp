import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class UnauthorizedError extends BaseError {
  constructor(message: string = 'Bad Request') {
    super(message, HttpStatusCodes.BadRequest);
  }
}
