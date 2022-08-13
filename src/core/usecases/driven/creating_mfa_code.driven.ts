import { Strategy } from '../../entities/strategy'

export interface CreatingMFACode {
  creatingCodeForStrategy: (
    userId: string,
    strategy: Strategy
  ) => Promise<{ hash: string; code: string }>
}
