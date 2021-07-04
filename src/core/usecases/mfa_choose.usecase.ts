import { Strategy } from '../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { FindingMFAChoose } from './driven/finding_mfa_choose.driven'
import { SendingMFACode } from './driven/sending_mfa_code.driven'
import {
  ChooseMFA,
  ChooseMFAErrors,
  ChooseMFAErrorsTypes,
} from './driver/choose_mfa.driver'

export default class MFAChoose implements ChooseMFA {
  constructor(
    private findingMFAChoose: FindingMFAChoose,
    private creatingMFACode: CreatingMFACode,
    private sendingMFACode: SendingMFACode
  ) {}

  async choose(
    hash: string,
    strategy: Strategy
  ): Promise<{ hash: string; code: string }> {
    const resp = await this.findingMFAChoose.findByHash(hash)
    if (!resp.strategyList.find((_) => _ === strategy)) {
      throw new ChooseMFAErrors(ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED)
    }
    const { hash: newHash, code } =
      await this.creatingMFACode.creatingCodeForStrategy(resp.userId, strategy)
    this.sendingMFACode.sendCodeForUser(resp.userId, code + newHash)
    return { hash: newHash, code }
  }
}
