import { compare } from 'bcrypt'
import { expect } from 'chai'
import request from 'supertest'

import redis from '../../../src/core/config/cache'
import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'
import { passwordGenerator } from '../../fixtures/generators'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Reset Password Route', () => {
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

  it('should succeed resetting password', async () => {
    const employeePassword = passwordGenerator()

    const responseF = await request(server)
      .post('/password/forget')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: managerFixture.input.email,
      })

    expect(responseF.status).to.be.equal(200)
    const raw = await redis.keys('*')
    expect(raw.length).to.be.equal(1)
    const hash = raw[0]
    const email = await redis.get(raw[0])
    expect(email).to.be.equal(managerFixture.input.email)

    const responseR = await request(server)
      .post('/password/recover')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hash: hash,
        password: employeePassword,
      })

    const [{ password_hash }] = await database('user').where({
      id: managerFixture.output.id,
    })
    expect(await compare(employeePassword, password_hash)).to.be.true
    expect(responseR.status).to.be.equal(200)
    await redis.del(raw[0])
  })

  it('should fail recovering when hash not found', async () => {
    const employeePassword = passwordGenerator()

    const responseR = await request(server)
      .post('/password/recover')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hash: 'any-hash',
        password: employeePassword,
      })
    expect(responseR.status).to.be.equal(500)
  })
})
