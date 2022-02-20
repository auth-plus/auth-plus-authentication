import { Strategy } from '../entities/strategy'

import { CreatingMFA, CreatingMFAErrorType } from './driven/creating_mfa.driven'
import { FindingUser } from './driven/finding_user.driven'
import {
  ValidatingMFA,
  ValidatingMFAErrorsTypes,
} from './driven/validating_mfa.driven'
import {
  CreateMFA,
  CreateMFAErrors,
  CreateMFAErrorsTypes,
} from './driver/create_mfa.driver'
import {
  ValidateMFA,
  ValidateMFAErrors,
  ValidateMFAErrorsTypes,
} from './driver/validate_mfa.driver'

export default class MFA implements CreateMFA, ValidateMFA {
  constructor(
    private findingUser: FindingUser,
    private creatingMFA: CreatingMFA,
    private validatingMFA: ValidatingMFA
  ) {}

  async create(userId: string, strategy: Strategy): Promise<string> {
    try {
      const user = await this.findingUser.findById(userId)
      return this.creatingMFA.creatingStrategyForUser(user, strategy)
    } catch (error) {
      throw this.handleError(error as Error)
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    try {
      return await this.validatingMFA.validate(mfaId)
    } catch (error) {
      throw this.handleError(error as Error)
    }
  }

  private handleError(error: Error) {
    switch (error.message) {
      case CreatingMFAErrorType.ALREADY_EXIST:
        return new CreateMFAErrors(CreateMFAErrorsTypes.ALREADY_EXIST)
      case CreatingMFAErrorType.INFO_NOT_EXIST:
        return new CreateMFAErrors(CreateMFAErrorsTypes.INFO_NOT_EXIST)
      case CreatingMFAErrorType.DATABASE_DEPENDECY_ERROR:
        return new CreateMFAErrors(CreateMFAErrorsTypes.DEPENDECY_ERROR)
      case ValidatingMFAErrorsTypes.NOT_FOUND:
        return new ValidateMFAErrors(ValidateMFAErrorsTypes.WRONG_CREDENTIAL)
      default:
        return new Error('MFA unmapped error')
    }
  }
}
