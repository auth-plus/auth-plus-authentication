import redis from '../config/cache'
import { CodeService } from '../services/code.service'
import { UuidService } from '../services/uuid.service'
import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/driven/creating_mfa_code.driven'
import {
  FindingMFACode,
  FindingMFACodeErrors,
  FindingMFACodeErrorsTypes,
} from '../usecases/driven/finding_mfa_code.driven'

export class MFACodeRepository implements CreatingMFACode, FindingMFACode {
  private TTL = 60 * 60 * 5
  constructor(
    private uuidService: UuidService,
    private codeService: CodeService
  ) {}

  async creatingCodeForStrategy(
    userId: string
  ): Promise<{ hash: string; code: string }> {
    try {
      const hash = this.uuidService.generateHash()
      const code = this.codeService.generateRandomNumber()
      await redis.set(hash, JSON.stringify({ userId, code }))
      await redis.expire(hash, this.TTL)
      return { hash, code }
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
      if (rawReturn === null) {
        throw new FindingMFACodeErrors(FindingMFACodeErrorsTypes.NOT_FOUND)
      }
      return JSON.parse(rawReturn) as { userId: string; code: string }
    } catch (error) {
      throw new FindingMFACodeErrors(
        FindingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
