import casual from 'casual'
import { expect } from 'chai'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'
import { passwordGenerator } from '../../fixtures/generators'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('User Route', () => {
  let managerFixture: UserFixture
  let token = ''
  before(async () => {
    managerFixture = await insertUserIntoDatabase()
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  after(async () => {
    await database('user').where('id', managerFixture.output.id).del()
  })

  it('should succeed when creating a user', async () => {
    const employeeName = casual.full_name
    const employeeEmail = casual.email.toLowerCase()
    const employeePassword = passwordGenerator()

    const response = await request(server)
      .post('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: employeeName,
        email: employeeEmail,
        password: employeePassword,
      })
    expect(response.status).to.be.equal(200)
    const tuples = await database('user')
      .select('*')
      .where('id', response.body.id)
    const row = tuples[0]
    expect(row.name).to.be.equal(employeeName)
    expect(row.email).to.be.equal(employeeEmail)

    await database('user').where({ id: response.body.id }).del()
  })

  it('should succeed when updating a user', async () => {
    const employeeFixture = await insertUserIntoDatabase()
    const newName = casual.full_name

    const response = await request(server)
      .patch('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: employeeFixture.output.id,
        name: newName,
      })
    expect(response.status).to.be.equal(200)
    const tuples = await database('user')
      .select('*')
      .where('id', employeeFixture.output.id)
    const row = tuples[0]
    expect(row.name).to.be.equal(newName)

    await database('user').where('id', employeeFixture.output.id).del()
  })
})
