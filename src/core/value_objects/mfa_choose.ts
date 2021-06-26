import { Strategy } from '../entities/strategy'

export interface MFAChoose {
  hash: string
  mfaList: Strategy[]
}
