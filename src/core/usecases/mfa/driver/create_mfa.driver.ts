import { Strategy } from '../common/strategy'

export interface CreateMFA {
  create: (userId: string, strategy: Strategy) => Promise<void>
}
