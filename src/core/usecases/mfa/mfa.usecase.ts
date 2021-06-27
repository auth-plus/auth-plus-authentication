import { CreateMFA, MFACreateInput } from './driver/create_mfa.driver'
import { CreatingMFA } from './driven/creating_mfa.driven'
import { ValidatingMFA } from './driven/validating_mfa.driven'

export default class MFA implements CreateMFA {
  constructor(
    private creatingMFA: CreatingMFA,
    private validatingMFA: ValidatingMFA
  ) {}

  async create(content: MFACreateInput): Promise<void> {
    const { name, userId, strategy } = content
    await this.creatingMFA.creatingStrategyForUser(name, userId, strategy)
  }

  async validate(mfaId: string): Promise<boolean> {
    return await this.validatingMFA.validate(mfaId)
  }
}
