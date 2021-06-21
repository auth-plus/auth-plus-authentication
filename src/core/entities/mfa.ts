import { Strategy } from './strategy'

export interface MFA {
  userId: string
  strategy: Strategy
}
