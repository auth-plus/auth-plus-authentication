import request from 'supertest'

import server from '../../../src/presentation/http/server'

describe('Server Route', () => {
  it('should succeed when access /metrics', async () => {
    const response = await request(server).get('/metrics')
    expect(response.status).toEqual(200)
    expect(response.text).toContain('histogram_request_bucket')
  })
  it('should succeed when access /health', async () => {
    const response = await request(server).get('/health')
    expect(response.status).toEqual(200)
    expect(response.text).toEqual('OK')
  })
  it('should fail when access a route that does not exist', async () => {
    const response = await request(server).get('/this-routes-does-not-exist')
    expect(response.status).toEqual(404)
    expect(response.text).toEqual('Sorry cant find that')
  })
})
