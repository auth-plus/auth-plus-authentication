import logger from '../../config/logger'

import {
  CreatingUser,
  CreatingUserErrorsTypes,
} from './driven/creating_user.driven'
import { FindingUser } from './driven/finding_user.driven'
import { UpdatingUser } from './driven/updating_user.driven'
import {
  CreateUser,
  CreateUserErrors,
  CreateUserErrorsTypes,
} from './driver/create_user.driver'
import {
  UpdateUser,
  UpdateUserError,
  UpdateUserErrorType,
  UpdateUserInput,
} from './driver/update_user.driver'

export default class UserUsecase implements CreateUser, UpdateUser {
  constructor(
    private findingUser: FindingUser,
    private creatingUser: CreatingUser,
    private updatingUser: UpdatingUser
  ) {}

  async create(name: string, email: string, password: string): Promise<string> {
    try {
      return await this.creatingUser.create(name, email, password)
    } catch (error) {
      throw this.handleError(error as Error)
    }
  }

  async update(input: UpdateUserInput): Promise<boolean> {
    const { userId, name, email, phone, deviceId, gaToken } = input
    let list: Array<Promise<boolean>> = []
    const user = await this.findingUser.findById(userId)
    if (name) {
      list = [...list, this.updatingUser.updateName(user.id, name)]
    }
    if (email) {
      list = [...list, this.updatingUser.updateEmail(user.id, email)]
    }
    if (phone) {
      list = [...list, this.updatingUser.updatePhone(user.id, phone)]
    }
    if (deviceId) {
      list = [...list, this.updatingUser.updateDevice(user.id, deviceId)]
    }
    if (gaToken) {
      list = [...list, this.updatingUser.updateGA(user.id, gaToken)]
    }
    const promisesList = await Promise.allSettled(list)
    const itsOk = promisesList.every((rtn) => rtn.status === 'fulfilled')
    if (!itsOk) {
      const listError = promisesList.reduce((result, current) => {
        if (current.status === 'rejected') {
          result = result + (current.reason as string)
        }
        return result
      }, '')
      logger.error(listError)
      throw new UpdateUserError(UpdateUserErrorType.DEPENDENCY_ERROR)
    } else {
      return itsOk
    }
  }

  private handleError(error: Error) {
    switch (error.message) {
      case CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR:
        return new CreateUserErrors(CreateUserErrorsTypes.DEPENDENCY_ERROR)
      case CreatingUserErrorsTypes.LOW_ENTROPY:
        return new CreateUserErrors(CreateUserErrorsTypes.SECURITY_LOW)
      default:
        return new CreateUserErrors(CreateUserErrorsTypes.DEPENDENCY_ERROR)
    }
  }
}
