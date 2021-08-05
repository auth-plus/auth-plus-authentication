import { Strategy } from '../../entities/strategy'

export interface CreateMFACode {
  create: (
    userId: string,
    strategy: Strategy
  ) => Promise<{ hash: string; code: string }>
}
