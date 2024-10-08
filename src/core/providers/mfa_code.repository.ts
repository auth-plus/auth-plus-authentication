import { authenticator } from 'otplib'

import { RedisClient } from '../config/cache'
import { Strategy } from '../entities/strategy'
import { CodeService } from '../services/code.service'
import { UuidService } from '../services/uuid.service'
import { CreatingMFACode } from '../usecases/driven/creating_mfa_code.driven'
import {
  FindingMFACode,
  FindingMFACodeErrors,
  FindingMFACodeErrorsTypes,
} from '../usecases/driven/finding_mfa_code.driven'
import {
  ValidatingCode,
  ValidatingCodeErrors,
  ValidatingCodeErrorsTypes,
} from '../usecases/driven/validating_code.driven'

export interface CacheCode {
  userId: string
  code: string
  strategy: Strategy
}

export class MFACodeRepository
  implements CreatingMFACode, FindingMFACode, ValidatingCode
{
  private TTL = 60 * 60 * 5

  constructor(
    private cache: RedisClient,
    private uuidService: UuidService,
    private codeService: CodeService
  ) {}

  async creatingCodeForStrategy(
    userId: string,
    strategy: Strategy
  ): Promise<{ hash: string; code: string }> {
    const hash = this.uuidService.generateHash()
    const code = this.codeService.generateRandomNumber()
    const content: CacheCode = { userId, code, strategy }
    await this.cache
      .multi()
      .set(hash, JSON.stringify(content))
      .expire(hash, this.TTL)
      .exec()
    return { hash, code }
  }

  async findByHash(hash: string): Promise<CacheCode> {
    const rawReturn = await this.cache.get(hash)
    if (rawReturn === null) {
      throw new FindingMFACodeErrors(
        FindingMFACodeErrorsTypes.MFA_CODE_HASH_NOT_FOUND
      )
    }
    return JSON.parse(rawReturn) as CacheCode
  }

  validate(inputCode: string, code: string): void {
    if (inputCode != code) {
      throw new ValidatingCodeErrors(ValidatingCodeErrorsTypes.DIFF_CODE)
    }
  }

  validateGA(inputCode: string, secret: string): void {
    const verified = authenticator.check(inputCode, secret)
    if (!verified) {
      throw new ValidatingCodeErrors(ValidatingCodeErrorsTypes.WRONG_CODE)
    }
  }
}
