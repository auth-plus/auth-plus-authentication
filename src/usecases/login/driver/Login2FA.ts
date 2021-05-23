import { Credential } from '../common/Credentials'
import { Strategy } from '../common/Strategy'

export interface Login2FA {
  multipleFactorAuthenyication: (
    code: string,
    strategy: Strategy
  ) => Promise<Credential>
}
