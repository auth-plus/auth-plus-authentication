import logger from '../../config/logger'
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
      return newHash
    } catch (error) {
      switch ((error as Error).message) {
        case FindingMFAChooseErrorsTypes.MFA_CHOOSE_HASH_NOT_FOUND:
        case SendingMfaCodeErrorsTypes.USER_EMAIL_NOT_FOUND:
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.NOT_FOUND)
        case ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED:
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
        case SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND:
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.SENDING_CODE_ERROR)
        default:
          logger.error(error)
          throw new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
      }
    }
  }
}
