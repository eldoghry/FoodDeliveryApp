import { Request, Response } from "express";

export class MasterController {
  async checkHealth(_req: Request, res: Response) {
    res.status(200).json({
      status: "OK",
    });
  }
}
