import { Strategy } from '../common/strategy'

export interface CreateMFACode {
  create: (userId: string, strategy: Strategy) => Promise<void>
}
