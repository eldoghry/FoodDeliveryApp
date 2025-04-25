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
    ...extra,
  });
}

export function sendPaginatedResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
): Response<ApiResponse<T>> {
  return sendResponse(res, statusCode, message, data, pagination);
}
