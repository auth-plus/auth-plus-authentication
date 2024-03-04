import request from 'supertest'

import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('MFA Route', () => {
  let userId: string
  beforeAll(async () => {
    const userFixture = await insertUserIntoDatabase()
    userId = userFixture.output.id
  })
  afterAll(async () => {
    await database('multi_factor_authentication').where('user_id', userId).del()
    await database('user').where('id', userId).del()
  })
  it('should succeed when creating', async () => {
    const response = await request(server).post('/mfa').send({
      userId: userId,
      strategy: Strategy.EMAIL,
    })
    const result = await database('multi_factor_authentication')
      .select('*')
      .where('user_id', userId)
    expect(response.status).toEqual(200)
    expect(result[0].is_enable).toEqual(false)
    await database('multi_factor_authentication').where('user_id', userId).del()
  })
  it('should succeed when validate', async () => {
    const mfaFixture = await insertMfaIntoDatabase(userId, Strategy.EMAIL)
    const mfaId = mfaFixture.output.id
    const response = await request(server)
      .post('/mfa/validate')
      .send({ id: mfaId })
    const result = await database('multi_factor_authentication')
      .select('*')
      .where('id', mfaId)
    expect(response.status).toEqual(200)
    expect(response.body.resp).toEqual(true)
    expect(result[0].is_enable).toEqual(true)
    await database('multi_factor_authentication').where('id', mfaId).del()
  })
  it('should succeed when list', async () => {
    const mfaFixtureEmail = await insertMfaIntoDatabase(userId, Strategy.EMAIL)
    const mfaFixturePhone = await insertMfaIntoDatabase(userId, Strategy.PHONE)
    const mfaIdE = mfaFixtureEmail.output.id
    const mfaIdP = mfaFixturePhone.output.id
    const response = await request(server).get(`/mfa/${userId}`).send()
    expect(response.status).toEqual(200)
    expect(response.body.resp).toEqual([Strategy.EMAIL, Strategy.PHONE])
    await database('multi_factor_authentication').where('id', mfaIdE).del()
    await database('multi_factor_authentication').where('id', mfaIdP).del()
  })
})
