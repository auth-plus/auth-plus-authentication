import { Strategy } from '../../entities/strategy'

export interface CreatingMFAChoose {
  create: (userId: string, strategyList: Strategy[]) => Promise<string>
}
