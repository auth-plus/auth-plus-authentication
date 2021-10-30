import { expect } from 'chai'
import request from 'supertest'

import database from '../../src/core/config/database'
import server from '../../src/server'

describe('User Route', () => {
  const ManagerName = 'test'
  const ManagerEmail = 'teste@test.com'
  const EmployeeName = 'test2'
  const EmployeeEmail = 'teste2@test.com'
  let token = ''
  beforeEach(async () => {
    await database('user').insert({
      name: ManagerName,
      email: ManagerEmail,
      password_hash:
        '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
    })
    const response = await request(server).post('/login').send({
      email: ManagerEmail,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    token = response.body.token
  })

  after(async () => {
    await database('user')
      .where({ name: EmployeeName, email: EmployeeEmail })
      .del()
  })

  it('should succeed when creating a user', async () => {
    const response = await request(server)
      .post('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: EmployeeName,
        email: EmployeeEmail,
        password: '7061651770d7b3ad8fa96e7a8bc61447',
      })
    expect(response.status).to.be.equal(200)
    const tuples = await database('user')
      .select('*')
      .where('id', response.body.id)
      .returning('id')
    const row = tuples[0]
    expect(row.name).to.be.equal(EmployeeName)
    expect(row.email).to.be.equal(EmployeeEmail)
  })
})
