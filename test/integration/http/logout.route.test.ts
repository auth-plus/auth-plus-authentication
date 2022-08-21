import { expect } from 'chai'
import request from 'supertest'

import cache from '../../../src/core/config/cache'
import server from '../../../src/presentation/http/server'
import { tokenGenerator } from '../../fixtures/generators'

describe('Logout Route', () => {
  const token = tokenGenerator()

  after(async () => {
    await cache.del(token)
  })

  it('should succeed when logout', async () => {
    const response = await request(server)
      .post('/logout')
      .set('Authorization', `Bearer ${token}`)
      .send()
    const result = await cache.get(token)
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
    expect(result).to.be.equal(token)
  })
})
