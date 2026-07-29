import { logger } from '../../config/logger'
import { ShallowUser } from '../entities/user'
import { CreatingSystemUser } from './driven/creating_system_user.driven'
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
import { ListUser } from './driver/list_user.driver'
import {
  UpdateUser,
  UpdateUserError,
  UpdateUserErrorType,
  UpdateUserInput,
} from './driver/update_user.driver'

export default class UserUsecase implements CreateUser, UpdateUser, ListUser {
  constructor(
    private findingUser: FindingUser,
    private creatingUser: CreatingUser,
    private updatingUser: UpdatingUser,
    private creatingSystemUser: CreatingSystemUser
  ) {}

  async create(name: string, email: string, password: string): Promise<string> {
    logger.info({ event: 'user.create.started', email }, 'User registration initiated')
    try {
      const userId = await this.creatingUser.create(name, email, password)
      await this.creatingSystemUser.create(userId)
      logger.info({ event: 'user.create.success', userId, email }, 'User registration completed successfully')
      return userId
    } catch (error) {
      const err = error as Error
      if (
        err.message ===
        CreatingUserErrorsTypes.PASSWORD_LOW_ENTROPY
      ) {
        logger.warn({ event: 'user.create.failed', email, reason: 'password_low_entropy' }, 'User registration failed: low entropy password')
        throw new CreateUserErrors(CreateUserErrorsTypes.SECURITY_LOW)
      }
      logger.error({ event: 'user.create.error', email, error: err.message }, 'User registration failed: dependency or internal error')
      throw new CreateUserErrors(CreateUserErrorsTypes.DEPENDENCY_ERROR)
    }
  }

  async update(input: UpdateUserInput): Promise<boolean> {
    const { userId, name, email, phone, deviceId, gaToken } = input
    logger.info(
      {
        event: 'user.update.started',
        userId,
        email,
        phone,
      },
      'User update initiated'
    )
    let list: Promise<boolean>[] = []
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
          result += current.reason as string
        }
        return result
      }, '')
      logger.error({ event: 'user.update.error', userId, error: listError }, 'User update failed')
      throw new UpdateUserError(UpdateUserErrorType.DEPENDENCY_ERROR)
    } else {
      logger.info({ event: 'user.update.success', userId }, 'User updated successfully')
      return itsOk
    }
  }

  async list(): Promise<ShallowUser[]> {
    return this.findingUser.getAll()
  }
}
