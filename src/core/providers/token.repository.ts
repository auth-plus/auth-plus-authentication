import { createToken } from '../../presentation/http/middlewares/jwt'
import cache from '../config/cache'
import { User } from '../entities/user'
import {
  CreatingToken,
  CreatingTokenErrors,
  CreatingTokenErrorsTypes,
} from '../usecases/driven/creating_token.driven'
import {
  InvalidatingToken,
  InvalidatingTokenErrors,
  InvalidatingTokenErrorsTypes,
} from '../usecases/driven/invalidating_token.driven'

export class TokenRepository implements InvalidatingToken, CreatingToken {
  private TTL = 60 * 60

  async invalidate(token: string): Promise<void> {
    try {
      await cache.set(token, token)
      await cache.expire(token, this.TTL)
    } catch (error) {
      throw new InvalidatingTokenErrors(
        InvalidatingTokenErrorsTypes.PROVIDER_ERROR
      )
    }
  }
  create(user: User): string {
    try {
      return createToken({ userId: user.id })
    } catch (error) {
      throw new CreatingTokenErrors(CreatingTokenErrorsTypes.PROVIDER_ERROR)
    }
  }
}
