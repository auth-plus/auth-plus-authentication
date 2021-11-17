import { Credential } from '../entities/credentials'
import { Strategy } from '../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { CreatingToken } from './driven/creating_token.driven'
import { FindingMFACode } from './driven/finding_mfa_code.driven'
import { FindingUser } from './driven/finding_user.driven'
import { CreateMFACode } from './driver/create_mfa_code.driver'
import { FindMFACode } from './driver/find_mfa_code.driver'

export default class MFACode implements CreateMFACode, FindMFACode {
  constructor(
    private creatingMFACode: CreatingMFACode,
    private findingMFACode: FindingMFACode,
    private findingUser: FindingUser,
    private creatingToken: CreatingToken
  ) {}

  async create(
    userId: string,
    strategy: Strategy
  ): Promise<{ hash: string; code: string }> {
    return this.creatingMFACode.creatingCodeForStrategy(userId, strategy)
  }

  async find(hash: string, code: string): Promise<Credential> {
    const resp = await this.findingMFACode.findByHash(hash)
    if (code != resp.code) {
      throw new Error('code diff')
    }
    const user = await this.findingUser.findById(resp.userId)
    const token = this.creatingToken.create(user)
    return Promise.resolve({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    } as Credential)
  }
}
