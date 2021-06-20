import { MFACodeRepository } from '../../providers/mfa_code.repository'
import { Strategy } from '../../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { CreateMFACode } from './driver/create_mfa_code.driver'

export default class MFACode implements CreateMFACode {
  private CODE_MASX_SIZE = 6

  private creatingMFACode: CreatingMFACode = new MFACodeRepository()

  async create(userId: string, strategy: Strategy): Promise<void> {
    const code = this.generateRandomNumber(this.CODE_MASX_SIZE)
    await this.creatingMFACode.creatingCodeForStrategy(userId, code, strategy)
  }

  private generateRandomNumber(size: number): string {
    let resp = ''
    for (let i = 0; i < size; i++) {
      const digit = Math.floor(Math.random() * 10)
      resp += digit
    }
    return resp
  }
}
