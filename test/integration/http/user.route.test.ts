import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('User Route', () => {
  const managerName = faker.name.findName()
  const managerEmail = faker.internet.email(managerName.split(' ')[0])
  const managerPassword = faker.internet.password(10)
  const employeeName = faker.name.findName()
  const employeeEmail = faker.internet.email(employeeName.split(' ')[0])
  const employeePassword = faker.internet.password(10)
  let token = ''
  let employeeId = ''
  before(async () => {
    await insertUserIntoDatabase(managerName, managerEmail, managerPassword)
    const response = await request(server).post('/login').send({
      email: managerEmail,
      password: managerPassword,
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
        password: employeePassword,
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
