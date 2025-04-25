import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

// todo: customize based on validation package
export default class ValidationError extends BaseError {
  constructor(message: string = 'Validation failed') {
    super(message, HttpStatusCodes.BadRequest);
  }
}
