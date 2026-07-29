import {logger} from '../../config/logger'
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
    logger.info({ event: 'auth.mfa.setup.started', userId, strategy }, 'MFA setup initiated')
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
      logger.info({ event: 'auth.mfa.setup.success', userId, strategy }, 'MFA setup completed and verification challenge sent')
      return mfa.secret ?? ''
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          logger.warn({ event: 'auth.mfa.setup.failed', userId, strategy, reason: 'user_not_found' }, 'MFA setup failed: user not found')
          throw new CreateMFAErrors(CreateMFAErrorsTypes.USER_NOT_FOUND)
        case CreatingMFAErrorType.MFA_ALREADY_EXIST:
          logger.warn({ event: 'auth.mfa.setup.failed', userId, strategy, reason: 'already_exists' }, 'MFA setup failed: strategy already exists')
          throw new CreateMFAErrors(CreateMFAErrorsTypes.ALREADY_EXIST)
        case CreatingMFAErrorType.MFA_INFO_NOT_EXIST:
          logger.warn({ event: 'auth.mfa.setup.failed', userId, strategy, reason: 'info_not_found' }, 'MFA setup failed: missing registration info')
          throw new CreateMFAErrors(CreateMFAErrorsTypes.INFO_NOT_EXIST)
        default:
          logger.error({ event: 'auth.mfa.setup.error', userId, strategy, error: err.message }, 'MFA setup failed: dependency or internal error')
          throw new CreateMFAErrors(CreateMFAErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    logger.info({ event: 'auth.mfa.validation.started', mfaId }, 'MFA validation initiated')
    try {
      const result = await this.validatingMFA.validate(mfaId)
      logger.info({ event: 'auth.mfa.validation.success', mfaId, success: result }, 'MFA validation completed')
      return result
    } catch (error) {
      logger.error({ event: 'auth.mfa.validation.error', mfaId, error: (error as Error).message }, 'MFA validation failed')
      throw new ValidateMFAErrors(ValidateMFAErrorsTypes.DEPENDECY_ERROR)
    }
  }

  async list(userId: string): Promise<Strategy[]> {
    logger.info({ event: 'auth.mfa.list.started', userId }, 'Listing user MFA strategies')
    try {
      const user = await this.findingUser.findById(userId)
      const list = await this.findingMFA.findMfaListByUserId(user.id)
      const strategies = list.map((_) => _.strategy)
      logger.info({ event: 'auth.mfa.list.success', userId, strategies }, 'User MFA strategies listed successfully')
      return strategies
    } catch (error) {
      const err = error as Error
      if (err.message === FindingUserErrorsTypes.USER_NOT_FOUND) {
        logger.warn({ event: 'auth.mfa.list.failed', userId, reason: 'user_not_found' }, 'Listing user MFA strategies failed: user not found')
        throw new ListMFAErrors(ListMFAErrorsTypes.USER_NOT_FOUND)
      }
      logger.error({ event: 'auth.mfa.list.error', userId, error: err.message }, 'Listing user MFA strategies failed')
      throw new ListMFAErrors(ListMFAErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
