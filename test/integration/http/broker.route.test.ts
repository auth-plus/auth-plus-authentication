import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import server from '../../../src/presentation/http/server'
import { run } from '../../../src/presentation/messaging/server'

describe('Broker Route', function () {
  before(() => {
    run()
  })
  this.timeout(5_000)
  it('should succeed when sending to broker', async () => {
    const response = await request(server).post('/broker').send({
      topic: 'health',
      payload: faker.datatype.json(),
    })
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
  })
  it('should succeed when creating a organization', async () => {
    const response = await request(server).post('/broker').send({
      topic: 'organization-create',
      payload: faker.datatype.json(),
    })
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
  })
})
