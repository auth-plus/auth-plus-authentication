import { CacheService } from '../config/cache'
import { Strategy } from '../entities/strategy'
import { TotpService } from '../services/totp.service'
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
    private cache: CacheService,
    private uuidService: UuidService,
    private totpService: TotpService
  ) {}

  async creatingCodeForStrategy(
    userId: string,
    strategy: Strategy
  ): Promise<{ hash: string; code: string }> {
    const hash = this.uuidService.generateHash()
    const code = this.totpService.codeGenerate()
    const content: CacheCode = { userId, code, strategy }
    await this.cache
      .set(`strategy:${hash}`, content, this.TTL)
    return { hash, code }
  }

  async findByHash(hash: string): Promise<CacheCode> {
    const rawReturn = await this.cache.get<CacheCode>(`strategy:${hash}`)
    if (rawReturn === null) {
      throw new FindingMFACodeErrors(
        FindingMFACodeErrorsTypes.MFA_CODE_HASH_NOT_FOUND
      )
    }
    return rawReturn
  }

  validate(inputCode: string, code: string): void {
    if (inputCode != code) {
      throw new ValidatingCodeErrors(ValidatingCodeErrorsTypes.DIFF_CODE)
    }
  }

  validateGA(inputCode: string, secret: string): void {
    const verified = this.totpService.validate(inputCode, secret)
    if (!verified) {
      throw new ValidatingCodeErrors(ValidatingCodeErrorsTypes.WRONG_CODE)
    }
  }
}
