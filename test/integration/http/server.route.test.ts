import { expect } from 'chai'
import request from 'supertest'

import server from '../../../src/presentation/http/server'

describe('Server Route', () => {
  it('/metrics', async () => {
    const response = await request(server).get('/metrics')
    expect(response.status).to.be.equal(200)
    expect(response.text).to.include('histogram_request_bucket')
  })
  it('/health', async () => {
    const response = await request(server).get('/health')
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.eql('OK')
  })
})
