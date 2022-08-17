import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'

describe('Protected Route', function () {
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  let id: string

  before(async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name,
        email,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0].id
  })

  after(async () => {
    await database('user').where('id', id).del()
  })
  it('should succeed when requesting a protected route', async () => {
    const responseLogin = await request(server).post('/login').send({
      email,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
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
