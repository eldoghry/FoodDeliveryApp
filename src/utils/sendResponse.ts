import { Response } from 'express';

export const sendResponse = (
  res: Response,
  status: number,
  message: string,
  data: any = null
) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};
