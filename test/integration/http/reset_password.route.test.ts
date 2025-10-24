import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { compare } from 'bcrypt'
import casual from 'casual'
import { Knex } from 'knex'
import request from 'supertest'

import * as env from '../../../src/config/enviroment_config'
import { getRedis, RedisClient } from '../../../src/core/config/cache'
import * as kafka from '../../../src/core/config/kafka'
import server from '../../../src/presentation/http/server'
import { passwordGenerator } from '../../fixtures/generators'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Reset Password Route', () => {
  let managerFixture: UserFixture
  let token = ''
  let database: Knex
  let redis: RedisClient
  let pgSqlContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer('postgres:15.1').start()
    redisContainer = await new RedisContainer('redis:7.0.5').start()
    database = await setupDB(pgSqlContainer)
    managerFixture = await insertUserIntoDatabase(database)
    redis = await getRedis(redisContainer.getConnectionUrl())
    if (!redis.isReady) {
      await redis.connect()
    }
    const jwtSecret = casual.uuid
    jest.spyOn(env, 'getEnv').mockImplementation(() => ({
      app: {
        enviroment: 'test',
        jwtSecret,
        name: casual.name,
        port: 5000,
      },
      database: {
        database: pgSqlContainer.getDatabase(),
        host: pgSqlContainer.getHost(),
        password: pgSqlContainer.getPassword(),
        port: pgSqlContainer.getPort(),
        user: pgSqlContainer.getUsername(),
      },
      broker: {
        url: '',
      },
      cache: {
        url: redisContainer.getConnectionUrl(),
      },
      zipkin: {
        url: '',
      },
    }))
    jest.spyOn(kafka, 'getKafka').mockImplementation(() => {
      return {
        producer: jest.fn().mockReturnValue({
          send: jest.fn(),
          connect: jest.fn(),
        }),
        admin: jest.fn(),
        logger: jest.fn(),
        consumer: jest.fn(),
      }
    })
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  afterAll(async () => {
    await redis.disconnect()
    await pgSqlContainer.stop()
    await redisContainer.stop()
  })

  beforeEach(async () => {
    redis.del('*')
  })

  it('should succeed resetting password', async () => {
    const employeePassword = passwordGenerator()

    const responseF = await request(server)
      .post('/password/forget')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: managerFixture.input.email,
      })

    expect(responseF.status).toEqual(200)
    const raw = await redis.keys('*')
    expect(raw.length).toEqual(1)
    const hash = raw[0]
    const email = await redis.get(raw[0])
    expect(email).toEqual(managerFixture.input.email)

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
    expect(await compare(employeePassword, password_hash)).toEqual(true)
    expect(responseR.status).toEqual(200)
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
    expect(responseR.status).toEqual(500)
  })
})
