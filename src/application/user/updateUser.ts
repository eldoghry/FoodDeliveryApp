import { User } from "../../domain/user/entities/user.entity";
import { UserRepository } from "./../../domain/user/repositories/user.repository";
export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {} // inject needed repository

  async execute(input: any): Promise<void> {
    // TODO: do some logic
  }
}
