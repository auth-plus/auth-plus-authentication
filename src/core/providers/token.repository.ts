import { createToken } from '../../presentation/http/middlewares/jwt'
import { redis, redisConnect } from '../config/cache'
import { User } from '../entities/user'
import { CreatingToken } from '../usecases/driven/creating_token.driven'
import { InvalidatingToken } from '../usecases/driven/invalidating_token.driven'

export class TokenRepository implements InvalidatingToken, CreatingToken {
  private TTL = 60 * 60

  @redisConnect()
  async invalidate(token: string): Promise<void> {
    await redis.set(token, token)
    await redis.expire(token, this.TTL)
  }

  create(user: User): string {
    return createToken({ userId: user.id })
  }
}
