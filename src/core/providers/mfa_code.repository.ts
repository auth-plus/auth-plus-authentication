import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/driven/creating_mfa_code.driven'
import redis from '../config/redis'
import { UuidService } from '../services/uuid.service'
import { CodeService } from '../services/code.service'
import { FindingMFACode } from '../usecases/driven/finding_mfa_code.driven'

export class MFACodeRepository implements CreatingMFACode, FindingMFACode {
  private TTL = 60 * 60 * 5
  constructor(
    private uuidService: UuidService,
    private codeService: CodeService
  ) {}

  async creatingCodeForStrategy(userId: string): Promise<string> {
    try {
      const hash = this.uuidService.generateHash()
      const code = this.codeService.generateRandomNumber()
      await redis.set(hash, JSON.stringify({ userId, code }))
      await redis.expire(hash, this.TTL)
      return code
    } catch (error) {
      console.error(error)
      throw new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }

  async findByHash(hash: string): Promise<{ userId: string; code: string }> {
    try {
      const rawReturn = await redis.get(hash)
      if (rawReturn === null)
        throw new CreatingMFACodeErrors(CreatingMFACodeErrorsTypes.NOT_FOUND)
      return JSON.parse(rawReturn) as { userId: string; code: string }
    } catch (error) {
      throw new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
