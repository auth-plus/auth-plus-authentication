import {
  CreatingMFA,
  CreatingMFAErrorsTypes,
} from './driven/creating_mfa.driven'
import {
  ValidatingMFA,
  ValidatingMFAErrorsTypes,
} from './driven/validating_mfa.driven'
import {
  CreateMFA,
  CreateMFAErrors,
  CreateMFAErrorsTypes,
  MFACreateInput,
} from './driver/create_mfa.driver'
import {
  ValidateMFA,
  ValidateMFAErrors,
  ValidateMFAErrorsTypes,
} from './driver/validate_mfa.driver'

export default class MFA implements CreateMFA, ValidateMFA {
  constructor(
    private creatingMFA: CreatingMFA,
    private validatingMFA: ValidatingMFA
  ) {}

  async create(content: MFACreateInput): Promise<string> {
    try {
      const { name, userId, strategy } = content
      return await this.creatingMFA.creatingStrategyForUser(
        name,
        userId,
        strategy
      )
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
      case CreatingMFAErrorsTypes.ALREADY_EXIST:
        return new CreateMFAErrors(CreateMFAErrorsTypes.WRONG_CREDENTIAL)
      case CreatingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR:
        return new CreateMFAErrors(CreateMFAErrorsTypes.DEPENDECY_ERROR)
      case ValidatingMFAErrorsTypes.NOT_FOUND:
        return new ValidateMFAErrors(ValidateMFAErrorsTypes.WRONG_CREDENTIAL)
      default:
        return new Error('MFA unmapper error')
    }
  }
}
