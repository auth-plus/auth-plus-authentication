import logger from '../../config/logger'
import { Credential } from '../entities/credentials'
import { Strategy } from '../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { CreatingToken } from './driven/creating_token.driven'
import { FindingMFA, FindingMFAErrorsTypes } from './driven/finding_mfa.driven'
import {
  FindingMFACode,
  FindingMFACodeErrorsTypes,
} from './driven/finding_mfa_code.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import {
  ValidatingCode,
  ValidatingCodeErrorsTypes,
} from './driven/validating_code.driven'
import {
  CreateMFACode,
  CreateMFACodeErrors,
  CreateMFACodeErrorsTypes,
} from './driver/create_mfa_code.driver'
import {
  FindMFACode,
  FindMFACodeError,
  FindMFACodeErrorType,
} from './driver/find_mfa_code.driver'

export default class MFACode implements CreateMFACode, FindMFACode {
  constructor(
    private creatingMFACode: CreatingMFACode,
    private findingMFACode: FindingMFACode,
    private findingUser: FindingUser,
    private creatingToken: CreatingToken,
    private validatingCode: ValidatingCode,
    private findingMFA: FindingMFA
  ) {}

  async create(userId: string, strategy: Strategy): Promise<string> {
    try {
      await this.findingMFA.checkMfaExist(userId, strategy)
      const { hash, code } = await this.creatingMFACode.creatingCodeForStrategy(
        userId,
        strategy
      )
      logger.info(code)
      return hash
    } catch (error) {
      if (
        (error as Error).message === FindingMFAErrorsTypes.MFA_ALREADY_EXIST
      ) {
        throw new CreateMFACodeErrors(
          CreateMFACodeErrorsTypes.MULTIPLE_STRATEGY
        )
      }
      throw new CreateMFACodeErrors(CreateMFACodeErrorsTypes.DEPENDECY_ERROR)
    }
  }

  async find(hash: string, code: string): Promise<Credential> {
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
      return Promise.resolve({
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      } as Credential)
    } catch (error) {
      switch ((error as Error).message) {
        case FindingMFACodeErrorsTypes.MFA_CODE_HASH_NOT_FOUND:
          throw new FindMFACodeError(FindMFACodeErrorType.NOT_FOUND)
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          throw new FindMFACodeError(FindMFACodeErrorType.NOT_FOUND)
        case FindingMFAErrorsTypes.MFA_NOT_FOUND:
          throw new FindMFACodeError(FindMFACodeErrorType.NOT_FOUND)
        case ValidatingCodeErrorsTypes.WRONG_CODE:
          throw new FindMFACodeError(FindMFACodeErrorType.WRONG_INFO)
        default:
          throw new FindMFACodeError(FindMFACodeErrorType.DEPENDECY_ERROR)
      }
    }
  }
}
