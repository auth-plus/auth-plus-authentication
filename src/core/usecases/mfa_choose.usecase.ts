import {logger} from '../../config/logger'
import { Strategy } from '../entities/strategy'
import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrorsTypes,
} from './driven/finding_mfa_choose.driven'
import {
  SendingMfaCode,
  SendingMfaCodeErrorsTypes,
} from './driven/sending_mfa_code.driven'
import {
  ChooseMFA,
  ChooseMFAErrors,
  ChooseMFAErrorsTypes,
} from './driver/choose_mfa.driver'

export default class MFAChoose implements ChooseMFA {
  constructor(
    private findingMFAChoose: FindingMFAChoose,
    private creatingMFACode: CreatingMFACode,
    private sendingMfaCode: SendingMfaCode
  ) {}

  async choose(hash: string, strategy: Strategy): Promise<string> {
    logger.info({ event: 'auth.mfa.choose.started', strategy }, 'MFA strategy choice initiated')
    try {
      const resp = await this.findingMFAChoose.findByHash(hash)
      if (!resp.strategyList.some((_) => _ === strategy)) {
        throw new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
      }
      const { hash: newHash, code } =
        await this.creatingMFACode.creatingCodeForStrategy(
          resp.userId,
          strategy
        )
      await this.sendingMfaCode.sendCodeByStrategy(resp.userId, code, strategy)
      logger.info({ event: 'auth.mfa.choose.success', userId: resp.userId, strategy }, 'MFA strategy chosen and verification code sent')
      return newHash
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case FindingMFAChooseErrorsTypes.MFA_CHOOSE_HASH_NOT_FOUND:
        case SendingMfaCodeErrorsTypes.USER_EMAIL_NOT_FOUND:
          logger.warn({ event: 'auth.mfa.choose.failed', strategy, reason: 'not_found', error: err.message }, 'MFA strategy choice failed: target not found')
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.NOT_FOUND)
        case ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED:
          logger.warn({ event: 'auth.mfa.choose.failed', strategy, reason: 'strategy_not_listed' }, 'MFA strategy choice failed: strategy not listed')
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
        case SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND:
          logger.warn({ event: 'auth.mfa.choose.failed', strategy, reason: 'sending_code_error', error: err.message }, 'MFA strategy choice failed: phone code transmission error')
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.SENDING_CODE_ERROR)
        default:
          logger.error({ event: 'auth.mfa.choose.error', strategy, error: err.message }, 'MFA strategy choice failed: dependency or internal error')
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }
}
