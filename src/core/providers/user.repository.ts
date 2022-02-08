import database from '../config/database'
import { User, UserInfo } from '../entities/user'
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
import {
  UpdatingUser,
  UpdatingUserErrors,
  UpdatingUserErrorsTypes,
} from '../usecases/driven/updating_user.driven'

export interface UserRow {
  id: string
  name: string
  email: string
  phone: string
  password_hash: string
}

type UserInfoType = 'phone' | 'ga' | 'deviceId'

export interface UserInfoRow {
  id: string
  user_id: string
  type: UserInfoType
  value: string
  created_at: string
}

export class UserRepository implements FindingUser, CreatingUser, UpdatingUser {
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
      const passwordOk = await this.passwordService.compare(
        password,
        list[0].password_hash
      )
      if (!passwordOk) {
        throw new FindingUserErrors(FindingUserErrorsTypes.PASSWORD_WRONG)
      }
      const info = await this.getUserInfoById(list[0].id)
      return {
        id: list[0].id,
        name: list[0].name,
        email: list[0].email,
        info,
      } as User
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
      const info = await this.getUserInfoById(list[0].id)
      return {
        id: list[0].id,
        name: list[0].name,
        email: list[0].email,
        info,
      } as User
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
      const response: Array<{ id: string }> = await database<UserRow>('user')
        .insert(insertLine)
        .returning('id')
      return response[0].id
    } catch (error) {
      throw new CreatingUserErrors(
        CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async updateName(userId: string, name: string): Promise<boolean> {
    try {
      const response = await database<UserRow>('user')
        .update({ name })
        .where('id', userId)
      return response > 0
    } catch (error) {
      throw new UpdatingUserErrors(
        UpdatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async updateEmail(userId: string, email: string): Promise<boolean> {
    try {
      const response = await database<UserRow>('user')
        .update({ email })
        .where('id', userId)
      return response > 0
    } catch (error) {
      throw new UpdatingUserErrors(
        UpdatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async updatePhone(userId: string, phone: string): Promise<boolean> {
    try {
      const readResponse = await database<UserInfoRow>('user_info')
        .select('*')
        .where('user_id', userId)
        .andWhere('type', 'phone')
      if (readResponse.length === 0) {
        const insertResponse = await database<UserInfoRow>('user_info')
          .insert({
            type: 'phone',
            value: phone,
            user_id: userId,
          })
          .returning('id')
        return insertResponse.length === 1
      } else {
        const updateResponse = await database<UserInfoRow>('user_info')
          .update({ type: 'phone', value: phone })
          .where('user_id', userId)
        return updateResponse > 0
      }
    } catch (error) {
      console.error(error)
      throw new UpdatingUserErrors(
        UpdatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async updateDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const readResponse = await database<UserInfoRow>('user_info')
        .select('*')
        .where('user_id', userId)
        .andWhere('type', 'deviceId')
      if (readResponse.length === 0) {
        const insertResponse = await database<UserInfoRow>('user_info')
          .insert({
            type: 'deviceId',
            value: deviceId,
            user_id: userId,
          })
          .returning('id')
        return insertResponse.length === 1
      } else {
        const updateResponse = await database<UserInfoRow>('user_info')
          .update({ type: 'deviceId', value: deviceId })
          .where('user_id', userId)
        return updateResponse > 0
      }
    } catch (error) {
      throw new UpdatingUserErrors(
        UpdatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async updateGA(userId: string, token: string): Promise<boolean> {
    try {
      const readResponse = await database<UserInfoRow>('user_info')
        .select('*')
        .where('user_id', userId)
        .andWhere('type', 'ga')
      if (readResponse.length === 0) {
        const insertResponse = await database<UserInfoRow>('user_info')
          .insert({
            type: 'ga',
            value: token,
            user_id: userId,
          })
          .returning('id')
        return insertResponse.length === 1
      } else {
        const updateResponse = await database<UserInfoRow>('user_info')
          .update({ type: 'ga', value: token })
          .where('user_id', userId)
        return updateResponse > 0
      }
    } catch (error) {
      throw new UpdatingUserErrors(
        UpdatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  private async getUserInfoById(userId: string): Promise<UserInfo> {
    const userInfolist = await database<UserInfoRow>('user_info')
      .where('user_id', userId)
      .limit(1)
    return userInfolist.reduce(
      (output, current) => {
        if (current.type === 'phone') {
          output = { ...output, phone: current.value }
        }
        if (current.type === 'deviceId') {
          output = { ...output, deviceId: current.value }
        }
        if (current.type === 'ga') {
          output = { ...output, googleAuth: current.value }
        }
        return output
      },
      {
        phone: null,
        deviceId: null,
        googleAuth: null,
      } as UserInfo
    )
  }
}
