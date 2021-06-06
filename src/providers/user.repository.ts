import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../usecases/login/driven/finding_user.driven'
import database from '../config/knex'
import { PasswordService } from '../services/password.service'
import { User } from '../usecases/user/driver/create_user.driver'
import {
  CreatingUser,
  CreatingUserErrorsTypes,
  CreatingUserErrors,
} from '../usecases/user/driven/creating_user.driven'

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
}
export class UserRepository implements FindingUser, CreatingUser {
  private passwordService: PasswordService

  constructor(passwordService: PasswordService) {
    this.passwordService = passwordService
  }

  async findUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    try {
      const list = await database<UserRow>('user')
        .where('email', email)
        .limit(1)
      if (list.length === 0)
        throw new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
      const { id, name, password_hash } = list[0]
      const passwordOk = await this.passwordService.compare(
        password,
        password_hash
      )
      if (!passwordOk)
        throw new FindingUserErrors(FindingUserErrorsTypes.PASSWORD_WRONG)
      return { id, name, email } as User
    } catch (error) {
      throw new FindingUserErrors(
        FindingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async createByClass(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    try {
      const hash = await this.passwordService.generateHash(password)
      const insertLine = {
        name,
        email,
        password_hash: hash,
      }
      await database<UserRow>('user').insert(insertLine)
    } catch (error) {
      throw new CreatingUserErrors(
        CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }
}
