import { Credential } from '../entities/credentials'

import { CreatingMFAChoose } from './driven/creating_mfa_choose.driven'
import { CreatingToken } from './driven/creating_token.driven'
import { FindingMFA, FindingMFAErrorsTypes } from './driven/finding_mfa.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import {
  LoginUser,
  LoginUserErrors,
  LoginUserErrorsTypes,
  MFAChoose,
} from './driver/login_user.driver'

export default class Login implements LoginUser {
  constructor(
    private findingUser: FindingUser,
    private findingMFA: FindingMFA,
    private creatingMFAChoose: CreatingMFAChoose,
    private creatingToken: CreatingToken
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
      const mfaList = await this.findingMFA.findMfaListByUserId(user.id)
      if (mfaList.length > 0) {
        const strategyList = mfaList.map((_) => _.strategy)
        const hash = await this.creatingMFAChoose.create(user.id, strategyList)
        return { hash, strategyList }
      } else {
        const token = this.creatingToken.create(user)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          info: user.info,
          token,
        } as Credential
      }
    } catch (error) {
      switch ((error as Error).message) {
        case FindingUserErrorsTypes.PASSWORD_WRONG:
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        case FindingMFAErrorsTypes.MFA_NOT_FOUND:
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        default:
          throw new LoginUserErrors(LoginUserErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }
}
