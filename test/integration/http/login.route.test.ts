import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import cache from '../../../src/core/config/cache'
import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { CacheCode } from '../../../src/core/providers/mfa_code.repository'
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('Login Route', () => {
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  const password = faker.internet.password(10)
  let id: string

  before(async () => {
    const userFixture = await insertUserIntoDatabase(name, email, password)
    id = userFixture.output.id
  })

  after(async () => {
    await database('user').where('id', id).del()
  })

  it('should succeed when login when user does NOT have MFA', async function () {
    const response = await request(server).post('/login').send({
      email,
      password,
    })
    expect(response.status).to.be.equal(200)
    expect(response.body.id).to.be.equal(id)
    expect(response.body.name).to.be.equal(name)
    expect(response.body.email).to.be.equal(email)
    expect(response.body.token).to.be.not.null
  })

  it('should fail when login with worng password', async function () {
    const response = await request(server).post('/login').send({
      email,
      password: 'this-password-is-wrong',
    })
    expect(response.status).to.be.equal(500)
    expect(response.text).to.be.equal('WRONG_CREDENTIAL')
  })

  it('should succeed when login with MFA=EMAIL', async function () {
    const mfaFixture = await insertMfaIntoDatabase(id, Strategy.EMAIL)
    const mfaId = mfaFixture.output.id
    const responseGetChoice = await request(server).post('/login').send({
      email,
      password,
    })
    expect(responseGetChoice.status).to.be.equal(200)
    expect(responseGetChoice.body.hash).to.not.be.null
    expect(responseGetChoice.body.strategyList).to.be.deep.equal([
      Strategy.EMAIL,
    ])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).to.be.equal(200)
    expect(responseChoose.body.hash).to.not.be.null
    const cacheContent = await cache.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).to.be.equal(200)
    expect(responseCode.body.id).to.be.equal(id)
    expect(responseCode.body.name).to.be.equal(name)
    expect(responseCode.body.email).to.be.equal(email)
    expect(responseCode.body.token).to.be.not.null
    await database('multi_factor_authentication').where('id', mfaId).del()
  })

  it('should succeed when login with MFA=PHONE', async function () {
    const mfaFixture = await insertMfaIntoDatabase(id, Strategy.PHONE)
    const mfaid = mfaFixture.output.id
    const responseGetChoice = await request(server).post('/login').send({
      email,
      password,
    })
    expect(responseGetChoice.status).to.be.equal(200)
    expect(responseGetChoice.body.hash).to.not.be.null
    expect(responseGetChoice.body.strategyList).to.be.deep.equal([
      Strategy.PHONE,
    ])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).to.be.equal(200)
    expect(responseChoose.body.hash).to.not.be.null
    const cacheContent = await cache.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).to.be.equal(200)
    expect(responseCode.body.id).to.be.equal(id)
    expect(responseCode.body.name).to.be.equal(name)
    expect(responseCode.body.email).to.be.equal(email)
    expect(responseCode.body.token).to.be.not.null
    await database('multi_factor_authentication').where('id', mfaid).del()
  })
})
