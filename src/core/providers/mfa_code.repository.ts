import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/mfa/driven/creating_mfa_code.driven'
import redis from '../config/redis'
import { Strategy } from '../entities/strategy'

export class MFACodeRepository implements CreatingMFACode {
  private TTL = 60 * 15
  async creatingCodeForStrategy(
    userId: string,
    code: string,
    strategy: Strategy
  ): Promise<void> {
    try {
      await redis.set(
        userId,
        JSON.stringify({ code, strategy }),
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
