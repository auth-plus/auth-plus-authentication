import { Strategy } from '../entities/strategy'

export interface MFAChoose {
  hash: string
  strategyList: Strategy[]
}
