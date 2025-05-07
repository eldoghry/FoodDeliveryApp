import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private repo = new UserRepository();
  async createUser(data: any) {
    const newUser = await this.repo.createUser(data);
    return newUser;
  }
}
