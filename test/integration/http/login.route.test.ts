import request from 'supertest'

import redis from '../../../src/core/config/cache'
import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { CacheCode } from '../../../src/core/providers/mfa_code.repository'
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Login Route', () => {
  let userFixture: UserFixture
  beforeAll(async () => {
    userFixture = await insertUserIntoDatabase()
    if (!redis.isReady) {
      await redis.connect()
    }
  })

  afterAll(async () => {
    await database('user').where('id', userFixture.output.id).del()
  })

  it('should succeed when login when user does NOT have MFA', async function () {
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(response.status).toEqual(200)
    expect(response.body.id).toEqual(userFixture.output.id)
    expect(response.body.name).toEqual(userFixture.input.name)
    expect(response.body.email).toEqual(userFixture.input.email)
    expect(response.body.token).not.toBeNull()
  })

  it('should fail when login with worng password', async function () {
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: 'this-password-is-wrong',
    })
    expect(response.status).toEqual(500)
    expect(response.text).toEqual('WRONG_CREDENTIAL')
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
    expect(responseGetChoice.status).toEqual(200)
    expect(responseGetChoice.body.hash).not.toBeNull()
    expect(responseGetChoice.body.strategyList).toEqual([Strategy.EMAIL])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).toEqual(200)
    expect(responseChoose.body.hash).not.toBeNull()
    const cacheContent = await redis.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).toEqual(200)
    expect(responseCode.body.id).toEqual(userFixture.output.id)
    expect(responseCode.body.name).toEqual(userFixture.input.name)
    expect(responseCode.body.email).toEqual(userFixture.input.email)
    expect(responseCode.body.token).not.toBeNull()
    await database('multi_factor_authentication').where('id', mfaId).del()
    await redis.del(responseGetChoice.body.hash)
    await redis.del(responseChoose.body.hash)
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
    expect(responseGetChoice.status).toEqual(200)
    expect(responseGetChoice.body.hash).not.toBeNull()
    expect(responseGetChoice.body.strategyList).toEqual([Strategy.PHONE])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).toEqual(200)
    expect(responseChoose.body.hash).not.toBeNull()
    const cacheContent = await redis.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).toEqual(200)
    expect(responseCode.body.id).toEqual(userFixture.output.id)
    expect(responseCode.body.name).toEqual(userFixture.input.name)
    expect(responseCode.body.email).toEqual(userFixture.input.email)
    expect(responseCode.body.token).not.toBeNull()
    await database('multi_factor_authentication').where('id', mfaid).del()
    await redis.del(responseGetChoice.body.hash)
    await redis.del(responseChoose.body.hash)
  })

  it('should succeed refresh token when user does NOT have MFA', async function () {
    const responseLogin = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(responseLogin.status).toEqual(200)
    expect(responseLogin.body.id).toEqual(userFixture.output.id)
    expect(responseLogin.body.name).toEqual(userFixture.input.name)
    expect(responseLogin.body.email).toEqual(userFixture.input.email)
    expect(responseLogin.body.token).not.toBeNull()

    const responseRefresh = await request(server)
      .get(`/login/refresh/${responseLogin.body.token}`)
      .set('Authorization', `Bearer ${responseLogin.body.token}`)
      .send()

    expect(responseRefresh.status).toEqual(200)
    expect(responseRefresh.body.id).toEqual(userFixture.output.id)
    expect(responseRefresh.body.name).toEqual(userFixture.input.name)
    expect(responseRefresh.body.email).toEqual(userFixture.input.email)
    expect(responseRefresh.body.token).not.toBeNull()

    const cacheData = await redis.get(responseLogin.body.token)
    expect(cacheData).not.toBeNull()
    await redis.del(responseLogin.body.token)
  })
})
