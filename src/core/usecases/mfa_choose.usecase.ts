import { Strategy } from '../entities/strategy'

import {
  CreatingMFACode,
  CreatingMFACodeErrorsTypes,
} from './driven/creating_mfa_code.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrorsTypes,
} from './driven/finding_mfa_choose.driven'
import {
  Notification,
  NotificationErrorsTypes,
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
    private sendingMFACode: Notification
  ) {}

  async choose(hash: string, strategy: Strategy): Promise<string> {
    try {
      const resp = await this.findingMFAChoose.findByHash(hash)
      if (!resp.strategyList.some((_) => _ === strategy)) {
        throw new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
      }
      const { hash: newHash } =
        await this.creatingMFACode.creatingCodeForStrategy(
          resp.userId,
          strategy
        )
      if (strategy != Strategy.GA) {
        this.sendingMFACode.sendCodeForUser(resp.userId, newHash)
      }
      return newHash
    } catch (error) {
      throw this.handleError(error as Error)
    }
  }
  private handleError(error: Error) {
    switch (error.message) {
      case FindingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
      case FindingMFAChooseErrorsTypes.NOT_FOUND:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.NOT_FOUND)
      case CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
      case NotificationErrorsTypes.PROVIDER_ERROR:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
      case ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
      default:
        return new ChooseMFAErrors(ChooseMFAErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
