import { Credential } from '../common/Credentials'
import { Strategy } from '../common/Strategy'

export interface creatingMFA {
  create: (userId: string, strategy: Strategy) => Promise<Credential>
}
