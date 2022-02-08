import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'

describe('User Route', () => {
  const managerName = faker.name.findName()
  const managerEmail = faker.internet.email(managerName.split(' ')[0])
  const employeeName = faker.name.findName()
  const employeeEmail = faker.internet.email(employeeName.split(' ')[0])
  let token = ''
  let employeeId = ''
  before(async () => {
    await database('user').insert({
      name: managerName,
      email: managerEmail,
      password_hash:
        '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
    })
    const response = await request(server).post('/login').send({
      email: managerEmail,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    token = response.body.token
  })

  after(async () => {
    await database('user')
      .where({ name: employeeName, email: employeeEmail })
      .del()
    await database('user')
      .where({ name: managerName, email: managerEmail })
      .del()
  })

  it('should succeed when creating a user', async () => {
    const response = await request(server)
      .post('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: employeeName,
        email: employeeEmail,
        password: '7061651770d7b3ad8fa96e7a8bc61447',
      })
    expect(response.status).to.be.equal(200)
    employeeId = response.body.id
    const tuples = await database('user').select('*').where('id', employeeId)
    const row = tuples[0]
    expect(row.name).to.be.equal(employeeName)
    expect(row.email).to.be.equal(employeeEmail)
  })

  it('should succeed when updating a user', async () => {
    const newName = faker.name.findName()
    const response = await request(server)
      .patch('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: employeeId,
        name: newName,
      })
    expect(response.status).to.be.equal(200)
    const tuples = await database('user').select('*').where('id', employeeId)
    const row = tuples[0]
    expect(row.name).to.be.equal(newName)
  })
})
