import { MFARepository } from '../../providers/mfa.repository'

import { CreateMFA, MFACreateInput } from './driver/create_mfa.driver'
import { CreatingMFA } from './driven/creating_mfa.driven'

export default class MFA implements CreateMFA {
  private creatingMFA: CreatingMFA = new MFARepository()

  async create(content: MFACreateInput): Promise<void> {
    const { name, userId, strategy } = content
    await this.creatingMFA.creatingStrategyForUser(name, userId, strategy)
  }
}
