import { expect } from 'chai'
import request from 'supertest'

import database from '../../src/core/config/database'
import server from '../../src/server'

describe('Login Route', () => {
  const name = 'test'
  const email = 'teste@test.com'

  after(async () => {
    await database('user').where({ name, email }).del()
  })

  it('should succeed when login', async () => {
    const response = await request(server).post('/user').send({
      name,
      email,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    expect(response.status).to.be.equal(200)
    const tuples = await database('user')
      .select('*')
      .where('id', response.body.id)
      .returning('id')
    const row = tuples[0]
    expect(row.name).to.be.equal(name)
    expect(row.email).to.be.equal(email)
  })
})
