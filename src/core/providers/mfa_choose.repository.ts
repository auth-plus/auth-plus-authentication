import { RedisClient } from '../config/cache'
import { Strategy } from '../entities/strategy'
import { UuidService } from '../services/uuid.service'
import { CreatingMFAChoose } from '../usecases/driven/creating_mfa_choose.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrors,
  FindingMFAChooseErrorsTypes,
} from '../usecases/driven/finding_mfa_choose.driven'

export class MFAChooseRepository
  implements CreatingMFAChoose, FindingMFAChoose
{
  private TTL = 60 * 60 * 5
  constructor(
    private cache: RedisClient,
    private uuidService: UuidService
  ) {}

  async create(userId: string, strategyList: Strategy[]): Promise<string> {
    const hash = this.uuidService.generateHash()
    await this.cache
      .multi()
      .set(hash, JSON.stringify({ userId, strategyList }))
      .expire(hash, this.TTL)
      .exec()
    return hash
  }

  async findByHash(
    hash: string
  ): Promise<{ userId: string; strategyList: Strategy[] }> {
    const raw = await this.cache.get(hash)
    if (!raw) {
      throw new FindingMFAChooseErrors(
        FindingMFAChooseErrorsTypes.MFA_CHOOSE_HASH_NOT_FOUND
      )
    }
    return JSON.parse(raw) as { userId: string; strategyList: Strategy[] }
  }
}
