import { User } from "../../domain/user/entities/user.entity";
import { UserRepository } from "./../../domain/user/repositories/user.repository";
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {} // inject needed repository

  async execute(input: any): Promise<void> {
    // TODO: do some logic

    const newUser = new User(
      input.name,
      input.email,
      input.password,
      input.dob
    );

    return this.userRepository.save(newUser);
  }
}
