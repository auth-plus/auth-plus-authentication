import redis from '../config/cache'
import { Strategy } from '../entities/strategy'
import { UuidService } from '../services/uuid.service'
import {
  CreatingMFAChoose,
  CreatingMFAChooseErrors,
  CreatingMFAChooseErrorsTypes,
} from '../usecases/driven/creating_mfa_choose.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrors,
  FindingMFAChooseErrorsTypes,
} from '../usecases/driven/finding_mfa_choose.driven'

export class MFAChooseRepository
  implements CreatingMFAChoose, FindingMFAChoose
{
  private TTL = 60 * 60 * 5
  constructor(private uuidService: UuidService) {}

  async create(userId: string, strategyList: Strategy[]): Promise<string> {
    try {
      const hash = this.uuidService.generateHash()
      await redis.set(hash, JSON.stringify({ userId, strategyList }))
      await redis.expire(hash, this.TTL)
      return hash
    } catch (error) {
      throw new CreatingMFAChooseErrors(
        CreatingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }

  async findByHash(
    hash: string
  ): Promise<{ userId: string; strategyList: Strategy[] }> {
    try {
      const raw = await redis.get(hash)
      if (!raw) {
        throw new FindingMFAChooseErrors(FindingMFAChooseErrorsTypes.NOT_FOUND)
      }
      return JSON.parse(raw) as { userId: string; strategyList: Strategy[] }
    } catch (error) {
      throw new FindingMFAChooseErrors(
        FindingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
