import { expect } from 'chai'
import request from 'supertest'

import cache from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

describe('Logout Route', () => {
  it('should succeed when logout', async () => {
    const token = tokenGenerator()
    const response = await request(server)
      .post('/logout')
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
    const cacheData = await cache.get(token)
    expect(cacheData).to.not.be.null
    expect(cacheData).to.be.equal(token)
    await cache.del(token)
  })
})
