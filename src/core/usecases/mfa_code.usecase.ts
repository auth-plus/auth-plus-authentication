import { logger } from '../../config/logger'
import { Credential } from '../entities/credentials'
import { Strategy } from '../entities/strategy'
import { CreatingToken } from '../driven/creating_token.driven'
import { FindingMFA, FindingMFAErrorsTypes } from '../driven/finding_mfa.driven'
import {
  FindingMFACode,
  FindingMFACodeErrorsTypes,
} from '../driven/finding_mfa_code.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from '../driven/finding_user.driven'
import {
  ValidatingCode,
  ValidatingCodeErrorsTypes,
} from '../driven/validating_code.driven'
import {
  FindMFACode,
  FindMFACodeError,
  FindMFACodeErrorType,
} from '../driver/find_mfa_code.driver'

export default class MFACode implements FindMFACode {
  constructor(
    private findingMFACode: FindingMFACode,
    private findingUser: FindingUser,
    private creatingToken: CreatingToken,
    private validatingCode: ValidatingCode,
    private findingMFA: FindingMFA
  ) {}

  async find(hash: string, code: string): Promise<Credential> {
    logger.info(
      { event: 'auth.mfa.code.started' },
      'MFA code verification initiated'
    )
    try {
      const hashContent = await this.findingMFACode.findByHash(hash)
      const user = await this.findingUser.findById(hashContent.userId)
      await this.findingMFA.findMFAByUserIdAndStrategy(
        user.id,
        hashContent.strategy
      )
      if (hashContent.strategy === Strategy.GA && user.info.googleAuth) {
        this.validatingCode.validateGA(code, user.info.googleAuth)
      } else {
        this.validatingCode.validate(code, hashContent.code)
      }
      const token = this.creatingToken.create(user)
      logger.info(
        {
          event: 'auth.mfa.code.success',
          userId: user.id,
          strategy: hashContent.strategy,
        },
        'MFA code verified successfully'
      )
      return Promise.resolve({
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      } as Credential)
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case FindingMFACodeErrorsTypes.MFA_CODE_HASH_NOT_FOUND:
        case FindingUserErrorsTypes.USER_NOT_FOUND:
        case FindingMFAErrorsTypes.MFA_NOT_FOUND:
          logger.warn(
            {
              event: 'auth.mfa.code.failed',
              reason: 'not_found',
              error: err.message,
            },
            'MFA code verification failed: record not found'
          )
          throw new FindMFACodeError(FindMFACodeErrorType.NOT_FOUND)
        case ValidatingCodeErrorsTypes.WRONG_CODE:
          logger.warn(
            { event: 'auth.mfa.code.failed', reason: 'wrong_code' },
            'MFA code verification failed: incorrect verification code'
          )
          throw new FindMFACodeError(FindMFACodeErrorType.WRONG_INFO)
        default:
          logger.error(
            { event: 'auth.mfa.code.error', error: err.message },
            'MFA code verification failed: dependency or internal error'
          )
          throw new FindMFACodeError(FindMFACodeErrorType.DEPENDECY_ERROR)
      }
    }
  }
}
