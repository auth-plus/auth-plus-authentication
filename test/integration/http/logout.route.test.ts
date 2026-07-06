import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import request from 'supertest'

import { CacheService } from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

describe('Logout Route', () => {
  let redis: CacheService
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    redisContainer = await new RedisContainer('redis:7.0.5').start()
    redis = CacheService.getInstance()
    await redis.initialize(redisContainer.getConnectionUrl())
  })
  afterAll(async () => {
    redis.destroy()
    await redisContainer.stop()
  })

  it('should succeed when logout', async () => {
    const token = tokenGenerator()
    const response = await request(server)
      .post('/logout')
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.status).toEqual(200)
    expect(response.text).toEqual('Ok')
    const cacheData = await redis.get(`invalidate:${token}`)
    expect(cacheData).not.toBeNull()
    expect(cacheData).toEqual(token)
  })
})
