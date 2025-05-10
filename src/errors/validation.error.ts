import ApplicationError from './application.error';
import HttpStatusCodes from 'http-status-codes';

// todo: customize based on validation package
export default class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation failed') {
    super(message, HttpStatusCodes.BAD_REQUEST);
  }
}
