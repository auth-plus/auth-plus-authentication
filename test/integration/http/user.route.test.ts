import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
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

describe('User Route', () => {
  let database: Knex,
    managerFixture: UserFixture,
    pgSqlContainer: StartedPostgreSqlContainer,
    redis: RedisClient,
    redisContainer: StartedRedisContainer,
    token = ''

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
    jest.spyOn(kafka, 'getKafka').mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        send: jest.fn(),
        connect: jest.fn(),
      }),
      admin: jest.fn(),
      logger: jest.fn(),
      consumer: jest.fn(),
    }))
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

  it('should succeed when creating a user', async () => {
    const employeeName = casual.full_name,
      employeeEmail = casual.email.toLowerCase(),
      employeePassword = passwordGenerator(),
      response = await request(server)
        .post('/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: employeeName,
          email: employeeEmail,
          password: employeePassword,
        })
    expect(response.status).toEqual(201)
    const tuples = await database('user')
        .select('*')
        .where('id', response.body.id),
      row = tuples[0]
    expect(row.name).toEqual(employeeName)
    expect(row.email).toEqual(employeeEmail)

    await database('user').where({ id: response.body.id }).del()
  })

  it('should succeed when updating a user', async () => {
    const employeeFixture = await insertUserIntoDatabase(database),
      newName = casual.full_name,
      response = await request(server)
        .patch('/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: employeeFixture.output.id,
          name: newName,
        })
    expect(response.status).toEqual(200)
    const tuples = await database('user')
        .select('*')
        .where('id', employeeFixture.output.id),
      row = tuples[0]
    expect(row.name).toEqual(newName)

    await database('user').where('id', employeeFixture.output.id).del()
  })

  it('should succeed when list all users', async () => {
    const userA = await insertUserIntoDatabase(database),
      userB = await insertUserIntoDatabase(database),
      response = await request(server)
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .send()
    expect(response.status).toEqual(200)
    expect(response.body.list[0].id).toEqual(userB.output.id)
    expect(response.body.list[1].id).toEqual(userA.output.id)

    await database('user').where('id', userA.output.id).del()
    await database('user').where('id', userB.output.id).del()
  })
})
