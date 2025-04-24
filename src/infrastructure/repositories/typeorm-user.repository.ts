import { User } from "../../domain/user/entities/user.entity";
import { UserRepository } from "../../domain/user/repositories/user.repository";

export class TypeormUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // TODO: do something
  }

  async findById(id: string): Promise<User> {
    // TODO: do something
    return new User("name", "email", "password", new Date());
  }
}
