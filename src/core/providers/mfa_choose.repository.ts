import redis from '../config/redis'
import { Strategy } from '../entities/strategy'
import { UuidService } from '../services/uuid.service'
import {
  CreatingMFAChoose,
  CreatingMFAChooseErrors,
  CreatingMFAChooseErrorsTypes,
} from '../usecases/login/driven/creating_mfa_choose.driven'

export class MFAChooseRepository implements CreatingMFAChoose {
  constructor(private uuidService: UuidService) {}
  async create(userId: string, strategyList: Strategy[]): Promise<string> {
    try {
      const hash = this.uuidService.generateHash()
      await redis.set(hash, JSON.stringify({ userId, strategyList }))
      return hash
    } catch (error) {
      throw new CreatingMFAChooseErrors(
        CreatingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
