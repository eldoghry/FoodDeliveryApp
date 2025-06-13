import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import { CartService } from '../services/cart.service';
import { sendResponse } from '../utils/sendResponse';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { SettingService } from '../services/setting.service';
import { S } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import { SettingKey } from '../enums/setting.enum';

export class SettingController {
	// private cartService = new CartService();

	async getByKey(req: Request, res: Response) {
		const { key } = req.params;
		const setting = await SettingService.get(key as SettingKey);
		sendResponse(res, HttpStatusCodes.OK, 'Setting retrieved', setting);
	}

	async getAll(_req: Request, res: Response) {
		const settings = await SettingService.getAll();
		sendResponse(res, HttpStatusCodes.OK, 'Settings retrieved', settings);
	}

	async upsert(req: Request, res: Response) {
		const { key, value, description } = req.body;
		const newSetting = await SettingService.set(key, value, description);
		sendResponse(res, HttpStatusCodes.CREATED, 'Setting created', newSetting);
	}
}
