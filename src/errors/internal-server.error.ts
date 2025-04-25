import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class InternalServerError extends BaseError {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, HttpStatusCodes.InternalServerError);
  }
}
