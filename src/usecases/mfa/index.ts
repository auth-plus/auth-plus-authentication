import { CreateMFA } from './driver/CreateMFA'
import { CreatingMFA } from './driven/CreatingMFA'
import { Strategy } from './common/Strategy'
import { MFARepository } from '../../providers/MFARepository'

export default class MFA implements CreateMFA {
  private creatingMFA: CreatingMFA = new MFARepository()

  async create(userId: string, strategy: Strategy): Promise<void> {
    await this.creatingMFA.creatingStrategyForUser(userId, strategy)
  }
}
