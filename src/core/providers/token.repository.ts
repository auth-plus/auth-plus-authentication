import { createToken } from '../../presentation/http/middlewares/jwt'
import cache from '../config/cache'
import { User } from '../entities/user'
import { CreatingToken } from '../usecases/driven/creating_token.driven'
import {
  InvalidatingToken,
  InvalidatingTokenErrors,
  InvalidatingTokenErrorsTypes,
} from '../usecases/driven/invalidating_token.driven'
import { ListingToken } from '../usecases/driven/listing_token.driven'

export class TokenRepository
  implements InvalidatingToken, CreatingToken, ListingToken
{
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
    return createToken({ userId: user.id })
  }
}
