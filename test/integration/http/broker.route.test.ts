import { expect } from 'chai'
import request from 'supertest'

import server from '../../../src/presentation/http/server'
import { run } from '../../../src/presentation/messaging/server'
import { jsonGenerator } from '../../fixtures/generators'

describe('Broker Route', function () {
  before(() => {
    run()
  })
  it('should succeed when sending to broker', async () => {
    const response = await request(server).post('/broker').send({
      topic: 'health',
      payload: jsonGenerator(),
    })
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
  })
  it('should succeed when creating a organization', async () => {
    const response = await request(server).post('/broker').send({
      topic: 'organization-create',
      payload: jsonGenerator(),
    })
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('Ok')
  })
})
