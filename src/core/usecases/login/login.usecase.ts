import { Credential } from '../../entities/credentials'
import { MFAChoose } from '../../value_objects/mfa_choose'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from '../driven/finding_user.driven'
import { FindingMFA, FindingMFAErrorsTypes } from '../driven/finding_mfa.driven'
import { CreatingMFAChoose } from '../driven/creating_mfa_choose.driven'

import {
  LoginUser,
  LoginUserErrors,
  LoginUserErrorsTypes,
} from './driver/login_user.driver'

export default class Login implements LoginUser {
  constructor(
    private findingUser: FindingUser,
    private findingMFA: FindingMFA,
    private creatingMFAChoose: CreatingMFAChoose
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<Credential | MFAChoose> {
    try {
      const user = await this.findingUser.findUserByEmailAndPassword(
        email,
        password
      )
      const strategyList = await this.findingMFA.findMFAByUserId(user.id)
      if (strategyList.length > 0) {
        const hash = await this.creatingMFAChoose.create(user.id, strategyList)
        return Promise.resolve({ hash, strategyList })
      } else {
        return Promise.resolve({
          id: user.id,
          name: user.name,
          email,
        } as Credential)
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: Error) {
    switch (error.message) {
      case FindingUserErrorsTypes.PASSWORD_WRONG:
        return new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
      case FindingUserErrorsTypes.NOT_FOUND:
        return new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
      case FindingMFAErrorsTypes.NOT_FOUND:
        return new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
      default:
        return new LoginUserErrors(LoginUserErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
