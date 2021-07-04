import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/driven/creating_mfa_code.driven'
import redis from '../config/redis'
import { Strategy } from '../entities/strategy'
import { UuidService } from '../services/uuid.service'
import { CodeService } from '../services/code.service'

export class MFACodeRepository implements CreatingMFACode {
  private TTL = 60 * 15
  constructor(
    private uuidService: UuidService,
    private codeService: CodeService
  ) {}

  async creatingCodeForStrategy(
    userId: string,
    strategy: Strategy
  ): Promise<void> {
    try {
      const hash = this.uuidService.generateHash()
      const code = this.codeService.generateRandomNumber()
      await redis.set(
        hash,
        JSON.stringify({ userId, code, strategy }),
        'EXPIRE',
        this.TTL
      )
    } catch (error) {
      throw new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }

  async findCodeByUserId(
    userId: string
  ): Promise<{ code: string; strategy: Strategy }> {
    try {
      const rawReturn = await redis.get(userId)
      if (rawReturn === null)
        throw new CreatingMFACodeErrors(CreatingMFACodeErrorsTypes.NOT_FOUND)
      return JSON.parse(rawReturn) as { code: string; strategy: Strategy }
    } catch (error) {
      throw new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
