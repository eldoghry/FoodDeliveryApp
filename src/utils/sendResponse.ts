import { Response } from 'express';

type StatusType = 'success' | 'error';

interface ApiResponse<T> {
	status: StatusType;
	message: string;
	data?: T;
	[key: string]: any;
}

interface ApiMetaResponse<T> {
	limit: number;
	nextCursor: string | null;
	hasNextPage: boolean;
}

const getStatusFromCode = (statusCode: number) => {
	return statusCode >= 200 && statusCode < 400 ? 'success' : 'error';
};

export function sendResponse<T>(
	res: Response,
	statusCode: number,
	message: string,
	data?: T,
	extra?: Record<string, any>
): Response<ApiResponse<T>> {
	return res.status(statusCode).json({
		requestTime: new Date().toISOString(),
		status: getStatusFromCode(statusCode),
		message,
		data,
		...extra
	});
}

export function sendPaginatedResponse<T>(
	res: Response,
	statusCode: number,
	message: string,
	data: T[],
	meta?: ApiMetaResponse<T>
): Response<ApiResponse<T[]>> {
	return sendResponse(res, statusCode, message, data, { meta });
}
