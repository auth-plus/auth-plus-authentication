import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import request from 'supertest'

import { RedisClient, getRedis } from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

xdescribe('Logout Route', () => {
  let redis: RedisClient
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    redisContainer = await new RedisContainer().start()
    redis = getRedis(redisContainer.getConnectionUrl())
    if (!redis.isReady) {
      await redis.connect()
    }
  })
  afterAll(async () => {
    await redis.disconnect()
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
    const cacheData = await redis.get(token)
    expect(cacheData).not.toBeNull()
    expect(cacheData).toEqual(token)
  })
})
