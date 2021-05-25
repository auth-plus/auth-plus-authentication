import { Strategy } from '../common/Strategy'

export interface CreateMFA {
  create: (userId: string, strategy: Strategy) => Promise<void>
}
