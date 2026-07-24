import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { ValkeyContainer, StartedValkeyContainer } from '@testcontainers/valkey'
import request from 'supertest'

import { CacheService } from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

describe('Logout Route', () => {
  let redis: CacheService
  let valkeyContainer: StartedValkeyContainer

  beforeAll(async () => {
    valkeyContainer = await new ValkeyContainer('valkey/valkey:8.0').start()
    redis = CacheService.getInstance()
    await redis.initialize(valkeyContainer.getConnectionUrl())
  })
  afterAll(async () => {
    redis.destroy()
    await valkeyContainer.stop()
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
