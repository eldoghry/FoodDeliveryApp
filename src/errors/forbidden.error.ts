import { HttpStatusCodes } from '../enums';
import BaseError from './base.error';

export default class ForbiddenError extends BaseError {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(message, HttpStatusCodes.Forbidden);
  }
}
