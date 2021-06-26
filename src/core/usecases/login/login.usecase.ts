import { Credential } from '../../entities/credentials'
import { MFAChoose } from '../../value_objects/mfa_choose'
import { UuidService } from '../../services/uuid.service'

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
import { CreatingMFAChoose } from './driven/creating_mfa_choose.driven'

export default class Login implements LoginUser {
  private findingUser: FindingUser
  private findingMFA: FindingMFA
  private uuidService: UuidService
  private creatingMFAChoose: CreatingMFAChoose
  constructor(
    findingUser: FindingUser,
    findingMFA: FindingMFA,
    uuidService: UuidService,
    creatingMFAChoose: CreatingMFAChoose
  ) {
    this.findingUser = findingUser
    this.findingMFA = findingMFA
    this.uuidService = uuidService
    this.creatingMFAChoose = creatingMFAChoose
  }

  async login(
    email: string,
    password: string
  ): Promise<Credential | MFAChoose> {
    try {
      const user = await this.findingUser.findUserByEmailAndPassword(
        email,
        password
      )
      const mfaList = await this.findingMFA.findMFAByUserId(user.id)
      if (mfaList.length > 0) {
        const hash = this.uuidService.generateHash()
        await this.creatingMFAChoose.create({ hash, mfaList })
        return Promise.resolve({ hash, mfaList })
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
