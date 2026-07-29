import { sign } from 'jsonwebtoken'
import { CacheService } from '../config/cache'
import { User } from '../entities/user'
import { CreatingToken } from '../usecases/driven/creating_token.driven'
import { InvalidatingToken } from '../usecases/driven/invalidating_token.driven'
import { getEnv } from '../../config/enviroment_config'
import { logger } from '../../config/logger'

export class TokenRepository
  implements InvalidatingToken, CreatingToken {
  private TTL = 60 * 60
  constructor(private cache: CacheService) { }

  async invalidate(token: string): Promise<void> {
    logger.debug({ cacheKeyPattern: 'invalidate:*', action: 'set' }, 'Cache operation executed')
    await this.cache.set(`invalidate:${token}`, token, this.TTL)
  }

  create(user: User): string {
    logger.debug({ action: 'signToken', userId: user.id }, 'JWT token signed')
    const payload = { userId: user.id, now: Date.now() }
    return sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
      getEnv().app.jwtSecret
    )
  }
}
