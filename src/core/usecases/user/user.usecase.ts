import {
  CreatingUser,
  CreatingUserErrorsTypes,
} from '../driven/creating_user.driven'

import {
  CreateUser,
  CreateUserErrors,
  CreateUserErrorsTypes,
} from './driver/create_user.driver'

export default class User implements CreateUser {
  constructor(private creatingUser: CreatingUser) {}

  async create(name: string, email: string, password: string): Promise<void> {
    try {
      return await this.creatingUser.create(name, email, password)
    } catch (error) {
      this.handleError(error)
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
