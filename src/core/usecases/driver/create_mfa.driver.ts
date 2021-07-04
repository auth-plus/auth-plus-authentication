import { Strategy } from '../../entities/strategy'

export interface MFACreateInput {
  name: string
  userId: string
  strategy: Strategy
}
export interface CreateMFA {
  create: (content: MFACreateInput) => Promise<string>
}
