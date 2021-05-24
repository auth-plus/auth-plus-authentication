import { User, FindingUser } from '../usecases/login/driven/FindingUser'

export class UserRepository implements FindingUser {
  findUserByEmailAndPassword(email: string, password: string): Promise<User> {
    const user: User = { name: 'Andrew', email }
    return Promise.resolve(user)
  }
}
