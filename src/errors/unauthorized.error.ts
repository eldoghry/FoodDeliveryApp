import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, HttpStatusCodes.Unauthorized);
  }
}
