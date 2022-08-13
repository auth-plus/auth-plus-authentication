import { Strategy } from '../entities/strategy'

import { CreatingMFA, CreatingMFAErrorType } from './driven/creating_mfa.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import { ValidatingMFA } from './driven/validating_mfa.driven'
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
      const mfa = await this.creatingMFA.creatingStrategyForUser(user, strategy)
      return mfa.id
    } catch (error) {
      switch ((error as Error).message) {
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.USER_NOT_FOUND)
        case CreatingMFAErrorType.MFA_ALREADY_EXIST:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.ALREADY_EXIST)
        case CreatingMFAErrorType.MFA_INFO_NOT_EXIST:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.INFO_NOT_EXIST)
        default:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    try {
      return await this.validatingMFA.validate(mfaId)
    } catch (error) {
      throw new ValidateMFAErrors(ValidateMFAErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
