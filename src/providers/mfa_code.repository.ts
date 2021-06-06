import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/mfa/driven/creating_mfa_code.driven'
import redis from '../config/redis'
import { Strategy } from '../usecases/mfa/common/strategy'

export class MFACodeRepository implements CreatingMFACode {
  async creatingCodeForStrategy(
    userId: string,
    code: string,
    strategy: Strategy
  ): Promise<void> {
    try {
      await redis.set(userId, JSON.stringify({ code, strategy }))
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
