import { Credential } from '../common/credentials'
import { Strategy } from '../../mfa/common/strategy'

export interface LoginMFA {
  multipleFactorAuthenyication: (
    code: string,
    strategy: Strategy
  ) => Promise<Credential>
}
