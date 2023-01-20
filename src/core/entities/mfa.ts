import { Strategy } from './strategy'

export type Mfa = {
  id: string
  userId: string
  strategy: Strategy
  secret?: string
}
