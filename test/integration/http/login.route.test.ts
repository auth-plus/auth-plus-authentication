import { expect } from 'chai'
import request from 'supertest'

import cache from '../../../src/core/config/cache'
import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { CacheCode } from '../../../src/core/providers/mfa_code.repository'
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Login Route', () => {
  let userFixture: UserFixture
  before(async () => {
    userFixture = await insertUserIntoDatabase()
  })

  after(async () => {
    await database('user').where('id', userFixture.output.id).del()
  })

  it('should succeed when login when user does NOT have MFA', async function () {
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(response.status).to.be.equal(200)
    expect(response.body.id).to.be.equal(userFixture.output.id)
    expect(response.body.name).to.be.equal(userFixture.input.name)
    expect(response.body.email).to.be.equal(userFixture.input.email)
    expect(response.body.token).to.be.not.null
  })

  it('should fail when login with worng password', async function () {
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: 'this-password-is-wrong',
    })
    expect(response.status).to.be.equal(500)
    expect(response.text).to.be.equal('WRONG_CREDENTIAL')
  })

  it('should succeed when login with MFA=EMAIL', async function () {
    const mfaFixture = await insertMfaIntoDatabase(
      userFixture.output.id,
      Strategy.EMAIL
    )
    const mfaId = mfaFixture.output.id
    const responseGetChoice = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
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
    expect(responseCode.body.id).to.be.equal(userFixture.output.id)
    expect(responseCode.body.name).to.be.equal(userFixture.input.name)
    expect(responseCode.body.email).to.be.equal(userFixture.input.email)
    expect(responseCode.body.token).to.be.not.null
    await database('multi_factor_authentication').where('id', mfaId).del()
    await cache.del(responseGetChoice.body.hash)
    await cache.del(responseChoose.body.hash)
  })

  it('should succeed when login with MFA=PHONE', async function () {
    const mfaFixture = await insertMfaIntoDatabase(
      userFixture.output.id,
      Strategy.PHONE
    )
    const mfaid = mfaFixture.output.id
    const responseGetChoice = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
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
    expect(responseCode.body.id).to.be.equal(userFixture.output.id)
    expect(responseCode.body.name).to.be.equal(userFixture.input.name)
    expect(responseCode.body.email).to.be.equal(userFixture.input.email)
    expect(responseCode.body.token).to.be.not.null
    await database('multi_factor_authentication').where('id', mfaid).del()
    await cache.del(responseGetChoice.body.hash)
    await cache.del(responseChoose.body.hash)
  })

  it('should succeed refresh token when user does NOT have MFA', async function () {
    const responseLogin = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(responseLogin.status).to.be.equal(200)
    expect(responseLogin.body.id).to.be.equal(userFixture.output.id)
    expect(responseLogin.body.name).to.be.equal(userFixture.input.name)
    expect(responseLogin.body.email).to.be.equal(userFixture.input.email)
    expect(responseLogin.body.token).to.be.not.null

    const responseRefresh = await request(server)
      .get(`/login/refresh/${responseLogin.body.token}`)
      .set('Authorization', `Bearer ${responseLogin.body.token}`)
      .send()

    expect(responseRefresh.status).to.be.equal(200)
    expect(responseRefresh.body.id).to.be.equal(userFixture.output.id)
    expect(responseRefresh.body.name).to.be.equal(userFixture.input.name)
    expect(responseRefresh.body.email).to.be.equal(userFixture.input.email)
    expect(responseRefresh.body.token).to.be.not.null

    const cacheData = await cache.get(responseLogin.body.token)
    expect(cacheData).to.not.be.null
    await cache.del(responseLogin.body.token)
  })
})
