import { Strategy } from './strategy'

export interface Mfa {
  id: string
  userId: string
  strategy: Strategy
  secret?: string
}
