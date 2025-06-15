import { Request, Response } from 'express';
import HttpStatusCodes from 'http-status-codes';
import { sendResponse } from '../utils/sendResponse';
import { SettingService } from '../services/setting.service';
import { SettingKey } from '../enums/setting.enum';

export class SettingController {
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
