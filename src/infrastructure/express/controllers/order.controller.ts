import { CreateUserUseCase } from "./../../../application/user/create_user";
import { Request, Response } from "express";

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response) {
    // Todo: validate payload

    try {
      const input = req.body;
      const newUser = await this.createUserUseCase.execute(input);
      res.status(200).json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
