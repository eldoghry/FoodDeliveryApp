import HttpStatusCodes from 'http-status-codes';

export default class ApplicationError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly data?: any;

	constructor(
		message: string,
		statusCode: number = HttpStatusCodes.INTERNAL_SERVER_ERROR,
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
