import logger from '../../config/logger'
import { Strategy } from '../entities/strategy'

import { CreatingMFA, CreatingMFAErrorType } from './driven/creating_mfa.driven'
import { FindingMFA } from './driven/finding_mfa.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import { SendingMfaHash } from './driven/sending_mfa_hash.driven'
import { ValidatingMFA } from './driven/validating_mfa.driven'
import {
  CreateMFA,
  CreateMFAErrors,
  CreateMFAErrorsTypes,
} from './driver/create_mfa.driver'
import {
  ListMFA,
  ListMFAErrors,
  ListMFAErrorsTypes,
} from './driver/list_mfa.driver'
import {
  ValidateMFA,
  ValidateMFAErrors,
  ValidateMFAErrorsTypes,
} from './driver/validate_mfa.driver'

export default class MFA implements CreateMFA, ValidateMFA, ListMFA {
  constructor(
    private findingUser: FindingUser,
    private findingMFA: FindingMFA,
    private creatingMFA: CreatingMFA,
    private validatingMFA: ValidatingMFA,
    private sendingMfaHash: SendingMfaHash
  ) {}

  async create(userId: string, strategy: Strategy): Promise<string> {
    try {
      const user = await this.findingUser.findById(userId)
      const mfa = await this.creatingMFA.creatingStrategyForUser(user, strategy)
      switch (strategy) {
        case Strategy.EMAIL:
          await this.sendingMfaHash.sendMfaHashByEmail(user.id, mfa.id)
          break
        case Strategy.PHONE:
          await this.sendingMfaHash.sendMfaHashByPhone(user.id, mfa.id)
          break
        default:
          break
      }
      return mfa.secret ?? ''
    } catch (error) {
      switch ((error as Error).message) {
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.USER_NOT_FOUND)
        case CreatingMFAErrorType.MFA_ALREADY_EXIST:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.ALREADY_EXIST)
        case CreatingMFAErrorType.MFA_INFO_NOT_EXIST:
          throw new CreateMFAErrors(CreateMFAErrorsTypes.INFO_NOT_EXIST)
        default:
          logger.error(error)
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

  async list(userId: string): Promise<Strategy[]> {
    try {
      const user = await this.findingUser.findById(userId)
      const list = await this.findingMFA.findMfaListByUserId(user.id)
      return list.map((_) => _.strategy)
    } catch (error) {
      if ((error as Error).message === FindingUserErrorsTypes.USER_NOT_FOUND) {
        throw new ListMFAErrors(ListMFAErrorsTypes.USER_NOT_FOUND)
      }
      logger.error(error)
      throw new ListMFAErrors(ListMFAErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
