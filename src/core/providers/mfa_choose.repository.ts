import redis from '../config/redis'
import {
  CreatingMFAChoose,
  CreatingMFAChooseErrors,
  CreatingMFAChooseErrorsTypes,
} from '../usecases/login/driven/creating_mfa_choose.driven'
import { MFAChoose } from '../value_objects/mfa_choose'

export class MFAChooseRepository implements CreatingMFAChoose {
  async create(mFAChoose: MFAChoose): Promise<void> {
    try {
      await redis.set(mFAChoose.hash, JSON.stringify(mFAChoose.mfaList))
    } catch (error) {
      throw new CreatingMFAChooseErrors(
        CreatingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
