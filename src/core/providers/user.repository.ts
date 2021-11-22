import database from '../config/database'
import { User } from '../entities/user'
import { PasswordService } from '../services/password.service'
import {
  CreatingUser,
  CreatingUserErrorsTypes,
  CreatingUserErrors,
} from '../usecases/driven/creating_user.driven'
import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../usecases/driven/finding_user.driven'

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
}
export class UserRepository implements FindingUser, CreatingUser {
  constructor(private passwordService: PasswordService) {}

  async findUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    try {
      const list = await database<UserRow>('user')
        .where('email', email)
        .limit(1)
      if (list.length === 0) {
        throw new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
      }
      const { id, name, password_hash } = list[0]
      const passwordOk = await this.passwordService.compare(
        password,
        password_hash
      )
      if (!passwordOk) {
        throw new FindingUserErrors(FindingUserErrorsTypes.PASSWORD_WRONG)
      }
      return { id, name, email } as User
    } catch (error) {
      throw new FindingUserErrors(
        FindingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async findById(userId: string): Promise<User> {
    try {
      const list = await database<UserRow>('user').where('id', userId).limit(1)
      if (list.length === 0) {
        throw new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
      }
      return list[0] as User
    } catch (error) {
      throw new FindingUserErrors(
        FindingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }
  async create(name: string, email: string, password: string): Promise<string> {
    try {
      const isOk = this.passwordService.checkEntropy(password, [name, email])
      if (!isOk) {
        throw new CreatingUserErrors(CreatingUserErrorsTypes.LOW_ENTROPY)
      }
      const hash = await this.passwordService.generateHash(password)
      const insertLine = {
        name,
        email,
        password_hash: hash,
      }
      const response = await database<UserRow>('user')
        .insert(insertLine)
        .returning('id')
      return response[0]
    } catch (error) {
      throw new CreatingUserErrors(
        CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }
}
