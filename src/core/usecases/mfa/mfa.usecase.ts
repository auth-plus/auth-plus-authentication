import { CreatingMFA } from '../driven/creating_mfa.driven'
import { ValidatingMFA } from '../driven/validating_mfa.driven'

import { CreateMFA, MFACreateInput } from './driver/create_mfa.driver'
export default class MFA implements CreateMFA {
  constructor(
    private creatingMFA: CreatingMFA,
    private validatingMFA: ValidatingMFA
  ) {}

  async create(content: MFACreateInput): Promise<string> {
    const { name, userId, strategy } = content
    return await this.creatingMFA.creatingStrategyForUser(
      name,
      userId,
      strategy
    )
  }

  async validate(mfaId: string): Promise<boolean> {
    return await this.validatingMFA.validate(mfaId)
  }
}
