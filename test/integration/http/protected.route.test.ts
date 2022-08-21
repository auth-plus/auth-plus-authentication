import { expect } from 'chai'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Protected Route', function () {
  let userFixture: UserFixture

  before(async () => {
    userFixture = await insertUserIntoDatabase()
  })

  after(async () => {
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when requesting a protected route', async () => {
    const responseLogin = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    const response = await request(server)
      .get('/protected')
      .set('Authorization', `Bearer ${responseLogin.body.token}`)
      .send()
    expect(response.status).to.be.equal(200)
    expect(response.text).to.be.equal('ok')
    expect(response.headers['Authoorization']).to.not.be.equal(
      responseLogin.body.token
    )
  })
  it('should fail when requesting a protected route', async () => {
    const response = await request(server)
      .get('/protected')
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZGJkMDYyYy0xYjUxLTExZWQtOTdkYy0wMjQyYWMxODAwMDciLCJpYXQiOjE2NjA0MjgwNjQsImV4cCI6MTY2MDQyODEyNH0.Bi7EW1CZpG0LFVxIRdw8BjokVQU0kSK07uT-zrATACw`
      )
      .send()
    expect(response.status).to.be.equal(401)
    expect(response.text).to.be.equal('Unauthorized:jwt expired')
  })
})
