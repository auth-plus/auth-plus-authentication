import { Strategy } from '../../entities/strategy'
import { Credential } from '../../entities/credentials'

import {
  LoginUser,
  LoginUserErrors,
  LoginUserErrorsTypes,
} from './driver/login_user.driver'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import { FindingMFA, FindingMFAErrorsTypes } from './driven/finding_mfa.driven'
export default class Login implements LoginUser {
  private findingUser: FindingUser
  private findingMFA: FindingMFA
  constructor(findingUser: FindingUser, findingMFA: FindingMFA) {
    this.findingUser = findingUser
    this.findingMFA = findingMFA
  }

  async login(
    email: string,
    password: string
  ): Promise<Credential | Array<Strategy>> {
    try {
      const user = await this.findingUser.findUserByEmailAndPassword(
        email,
        password
      )
      const mfaList = await this.findingMFA.findMFAByUserId(user.id)
      if (mfaList.length > 0) {
        return Promise.resolve(mfaList)
      } else {
        return Promise.resolve({
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
