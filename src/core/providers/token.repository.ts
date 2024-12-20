import {
  createToken,
  removeJwtAttr,
} from '../../presentation/http/middlewares/jwt'
import { RedisClient } from '../config/cache'
import { User } from '../entities/user'
import { CreatingToken } from '../usecases/driven/creating_token.driven'
import { DecodingToken } from '../usecases/driven/decoding_token.driven'
import { InvalidatingToken } from '../usecases/driven/invalidating_token.driven'

export class TokenRepository
  implements InvalidatingToken, CreatingToken, DecodingToken
{
  private TTL = 60 * 60
  constructor(private cache: RedisClient) {}

  async invalidate(token: string): Promise<void> {
    if (!this.cache.isReady) {
      await this.cache.connect()
    }
    await this.cache.set(token, token)
    await this.cache.expire(token, this.TTL)
  }

  create(user: User): string {
    return createToken({ userId: user.id, now: Date.now() })
  }

  async decode(token: string): Promise<{ isValid: boolean; userId: string }> {
    const resp = await this.cache.get(token)
    const isValid = resp == null
    const data = removeJwtAttr(token)
    return { isValid, userId: data.userId }
  }
}
