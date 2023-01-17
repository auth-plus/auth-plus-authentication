import redis from '../config/cache'
import { UuidService } from '../services/uuid.service'
import { CreatingResetPassword } from '../usecases/driven/creating_reset_password.driven'
import {
  FindingResetPassword,
  FindingResetPasswordErrors,
  FindingResetPasswordErrorsTypes,
} from '../usecases/driven/finding_reset_password.driven'

export class ResetPasswordRepository
  implements CreatingResetPassword, FindingResetPassword
{
  private TTL = 60 * 60 * 2
  constructor(private uuidService: UuidService) {}

  async create(email: string): Promise<string> {
    const hash = this.uuidService.generateHash()
    await redis.multi().set(hash, email).expire(hash, this.TTL).exec()
    return hash
  }

  async findByHash(hash: string): Promise<string> {
    const raw = await redis.get(hash)
    if (!raw) {
      throw new FindingResetPasswordErrors(
        FindingResetPasswordErrorsTypes.RESET_PASSWORD_HASH_NOT_FOUND
      )
    }
    return raw
  }
}
