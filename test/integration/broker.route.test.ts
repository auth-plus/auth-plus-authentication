import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import server from '../../src/presentation/http/server'

describe('Broker Route', function () {
  this.timeout(5_000)
  it('should succeed when sending to broker', async () => {
    const response = await request(server).post('/broker').send({
      topic: 'health',
      payload: faker.datatype.json(),
    })
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
  })
})
