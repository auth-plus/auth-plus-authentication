import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import database from '../../src/core/config/database'
import { Strategy } from '../../src/core/entities/strategy'
import server from '../../src/presentation/http/server'

describe('MFA Route', () => {
  const name = faker.datatype.string()
  const email = faker.internet.email()
  let mfaId: string
  let user_id: string
  before(async () => {
    const rowU: string[] = await database('user')
      .insert({
        name,
        email,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    user_id = rowU[0]
    const row: string[] = await database('multi_factor_authentication')
      .insert({
        name,
        user_id,
        strategy: Strategy.EMAIL,
      })
      .returning('id')
    mfaId = row[0]
  })
  after(async () => {
    await database('multi_factor_authentication').where('id', mfaId).del()
    await database('user').where('id', user_id).del()
  })
  it('should succeed when validate', async () => {
    const response = await request(server)
      .post('/mfa/validate')
      .send({ id: mfaId })
    const result = await database('multi_factor_authentication')
      .select('*')
      .where('id', mfaId)
    expect(response.status).to.be.equal(200)
    expect(response.body.resp).to.be.equal(true)
    expect(result[0].is_enable).to.be.equal(true)
  })
})
