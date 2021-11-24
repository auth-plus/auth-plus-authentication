import logger from '../../config/logger'
import { Credential } from '../entities/credentials'
import { Strategy } from '../entities/strategy'

import { CreatingMFACode } from './driven/creating_mfa_code.driven'
import { CreatingToken } from './driven/creating_token.driven'
import { FindingMFA } from './driven/finding_mfa.driven'
import { FindingMFACode } from './driven/finding_mfa_code.driven'
import { FindingUser } from './driven/finding_user.driven'
import { ValidatingCode } from './driven/validating_code.driven'
import {
  CreateMFACode,
  CreateMFACodeErrors,
  CreateMFACodeErrorsTypes,
} from './driver/create_mfa_code.driver'
import { FindMFACode } from './driver/find_mfa_code.driver'

export default class MFACode implements CreateMFACode, FindMFACode {
  constructor(
    private creatingMFACode: CreatingMFACode,
    private findingMFACode: FindingMFACode,
    private findingUser: FindingUser,
    private creatingToken: CreatingToken,
    private validatingCode: ValidatingCode,
    private findingMFA: FindingMFA
  ) {}

  async create(userId: string, strategy: Strategy): Promise<string> {
    const mfaList = await this.findingMFA.findMFAListByUserId(userId)
    const mfaId = mfaList.filter((_) => (_.strategy = strategy))
    if (mfaId.length == 0) {
      throw new CreateMFACodeErrors(CreateMFACodeErrorsTypes.NO_STRATEGY)
    }
    if (mfaId.length >= 2) {
      throw new CreateMFACodeErrors(CreateMFACodeErrorsTypes.MULTIPLE_STRATEGY)
    }
    const { hash, code } = await this.creatingMFACode.creatingCodeForStrategy(
      userId,
      strategy
    )
    logger.info(code)
    return hash
  }

  async find(hash: string, code: string): Promise<Credential> {
    const hashContent = await this.findingMFACode.findByHash(hash)
    if (hashContent.strategy === Strategy.GA) {
      const mfa = await this.findingMFA.findMFAByUserIdAndStrategy(
        hashContent.userId,
        hashContent.strategy
      )
      await this.validatingCode.validateGA(code, mfa.value)
    } else {
      await this.validatingCode.validate(code, hashContent.code)
    }
    const user = await this.findingUser.findById(hashContent.userId)
    const token = this.creatingToken.create(user)
    return Promise.resolve({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    } as Credential)
  }
}
