import { logger } from '../../config/logger'
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
    logger.info({ event: 'auth.login.started', email }, 'Login attempt initiated')
    try {
      const user = await this.findingUser.findUserByEmailAndPassword(
        email,
        password
      )
      const mfaList = await this.findingMFA.findMfaListByUserId(user.id)
      if (mfaList.length > 0) {
        const strategyList = mfaList.map((_) => _.strategy)
        const hash = await this.creatingMFAChoose.create(user.id, strategyList)
        logger.info(
          { event: 'auth.login.mfa_required', userId: user.id, strategies: strategyList },
          'MFA validation required for user login'
        )
        return { hash, strategyList }
      }
      const token = this.creatingToken.create(user)
      logger.info({ event: 'auth.login.success', userId: user.id }, 'User logged in successfully')
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        info: user.info,
        token,
      } as Credential
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case FindingUserErrorsTypes.PASSWORD_WRONG:
          logger.warn(
            { event: 'auth.login.failed', email, reason: 'wrong_password' },
            'Login failed: incorrect password'
          )
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          logger.warn(
            { event: 'auth.login.failed', email, reason: 'user_not_found' },
            'Login failed: user not found'
          )
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        case FindingMFAErrorsTypes.MFA_NOT_FOUND:
          logger.warn(
            { event: 'auth.login.failed', email, reason: 'mfa_not_found' },
            'Login failed: MFA configuration not found'
          )
          throw new LoginUserErrors(LoginUserErrorsTypes.WRONG_CREDENTIAL)
        default:
          logger.error(
            { event: 'auth.login.error', email, error: err.message },
            'Login failed: dependency or internal error'
          )
          throw new LoginUserErrors(LoginUserErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }
}

