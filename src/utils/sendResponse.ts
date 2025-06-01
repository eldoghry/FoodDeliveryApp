import { Response } from 'express';

type StatusType = 'success' | 'error';

interface ApiResponse<T> {
	status: StatusType;
	message: string;
	data?: T;
	timestamp: string;
	[key: string]: any;
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
	page: number,
	perPage: number,
): Response<ApiResponse<T[]>> {
	const startIndex = (page - 1) * perPage;
	const paginatedData = data.slice(startIndex, startIndex + perPage); 
	const pagination = {
		total: data.length,
		page: page || 1,
		perPage: perPage || 10,
		totalPages: Math.ceil(data.length / perPage),
	}
	return sendResponse(res, statusCode, message, paginatedData, pagination);
}
