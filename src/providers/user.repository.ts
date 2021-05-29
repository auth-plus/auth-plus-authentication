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

export class UserRepository implements FindingUser, CreatingUser {
  private passwordService: PasswordService

  constructor(passwordService: PasswordService) {
    this.passwordService = passwordService
  }

  async findUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    const list = await database<User>('user')
      .where('email', email)
      .andWhere('password', password)
      .limit(1)
      .then()
    if (!list.length)
      throw new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
    return list[0]
  }

  async createByClass(
    name: string,
    email: string,
    password: string
  ): Promise<string> {
    try {
      const hash = await this.passwordService.generateHash(password)
      const insertLine = {
        name,
        email,
        password_hash: hash,
      }
      const result = await database('user').insert(insertLine).returning('id')
      if (result.length > 1) {
        throw new CreatingUserErrors(
          CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
        )
      }
      return Promise.resolve(result[0])
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
