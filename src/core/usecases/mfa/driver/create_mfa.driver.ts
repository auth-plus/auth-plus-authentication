import { Strategy } from '../../../entities/strategy'

export interface CreateMFA {
  create: (userId: string, strategy: Strategy) => Promise<void>
}
