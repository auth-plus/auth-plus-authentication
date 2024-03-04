import request from 'supertest'

import redis from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

describe('Logout Route', () => {
  beforeAll(async () => {
    if (!redis.isReady) {
      await redis.connect()
    }
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
    await redis.del(token)
  })
})
