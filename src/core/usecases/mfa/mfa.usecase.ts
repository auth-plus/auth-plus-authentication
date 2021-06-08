import { MFARepository } from '../../providers/mfa.repository'

import { CreateMFA } from './driver/create_mfa.driver'
import { CreatingMFA } from './driven/creating_mfa.driven'
import { Strategy } from './common/strategy'

export default class MFA implements CreateMFA {
  private creatingMFA: CreatingMFA = new MFARepository()

  async create(userId: string, strategy: Strategy): Promise<void> {
    await this.creatingMFA.creatingStrategyForUser(userId, strategy)
  }
}
