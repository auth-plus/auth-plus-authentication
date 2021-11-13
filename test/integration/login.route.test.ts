import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../src/core/config/database'
import server from '../../src/presentation/http/server'

describe('Login Route', () => {
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  let id: string

  before(async () => {
    const row: string[] = await database('user')
      .insert({
        name,
        email,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0]
  })

  after(async () => {
    await database('user').where('id', id).del()
  })

  it('should succeed when login', async () => {
    const response = await request(server).post('/login').send({
      email,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    expect(response.status).to.be.equal(200)
    expect(response.body.id).to.be.equal(id)
    expect(response.body.name).to.be.equal(name)
    expect(response.body.email).to.be.equal(email)
    expect(response.body.token).to.be.not.null
  })
})
