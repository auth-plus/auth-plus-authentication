import { Strategy } from '../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { CreateMFACode } from './driver/create_mfa_code.driver'

export default class MFACode implements CreateMFACode {
  constructor(private creatingMFACode: CreatingMFACode) {}

  async create(userId: string, strategy: Strategy): Promise<void> {
    await this.creatingMFACode.creatingCodeForStrategy(userId, strategy)
  }
}
