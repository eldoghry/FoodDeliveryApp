import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class NotFoundError extends BaseError {
  constructor(message: string = 'Resource') {
    super(`${message} not found`, HttpStatusCodes.NotFound);
  }
}
