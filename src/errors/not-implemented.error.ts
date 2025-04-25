import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class NotImplementedError extends BaseError {
  constructor(message: string = 'Method not implemented yet') {
    super(message, HttpStatusCodes.NotImplemented);
  }
}
