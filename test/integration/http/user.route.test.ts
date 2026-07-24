import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { ValkeyContainer, StartedValkeyContainer } from '@testcontainers/valkey'
import casual from 'casual'
import { Admin, Consumer, Kafka, Logger, Producer } from 'kafkajs'
import { Knex } from 'knex'
import request from 'supertest'

import * as env from '../../../src/config/enviroment_config'
import { CacheService } from '../../../src/core/config/cache'
import * as kafka from '../../../src/core/config/kafka'
import server from '../../../src/presentation/http/server'
import { passwordGenerator } from '../../fixtures/generators'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('User Route', () => {
  let database: Knex
  let managerFixture: UserFixture
  let pgSqlContainer: StartedPostgreSqlContainer
  let valkey: CacheService
  let valkeyContainer: StartedValkeyContainer
  let token = ''

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer('postgres:15.1').start()
    valkeyContainer = await new ValkeyContainer('valkey/valkey:8.0').start()
    database = await setupDB(pgSqlContainer)
    managerFixture = await insertUserIntoDatabase(database)
    valkey = CacheService.getInstance()
    await valkey.initialize(valkeyContainer.getConnectionUrl())
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
        url: valkeyContainer.getConnectionUrl(),
      },
      zipkin: {
        url: '',
      },
      signoz: {
        url: '',
      },
    }))
    jest.spyOn(kafka, 'getKafka').mockImplementation(
      () =>
        ({
          producer: jest.fn().mockReturnValue({
            send: jest.fn(),
            connect: jest.fn(),
          }) as unknown as Producer,
          admin: jest.fn() as unknown as Admin,
          logger: jest.fn() as unknown as Logger,
          consumer: jest.fn() as unknown as Consumer,
        }) as unknown as Kafka
    )
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  afterAll(async () => {
    valkey.destroy()
    await pgSqlContainer.stop()
    await valkeyContainer.stop()
  })

  beforeEach(async () => {
    await valkey.flush()
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
    expect(response.status).toEqual(201)
    const tuples = await database('user')
      .select('*')
      .where('id', response.body.id)
    const row = tuples[0]
    expect(row.name).toEqual(employeeName)
    expect(row.email).toEqual(employeeEmail)

    await database('user').where({ id: response.body.id }).del()
  })

  it('should succeed when updating a user', async () => {
    const employeeFixture = await insertUserIntoDatabase(database)
    const newName = casual.full_name
    const response = await request(server)
      .patch('/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: employeeFixture.output.id,
        name: newName,
      })
    expect(response.status).toEqual(200)
    const tuples = await database('user')
      .select('*')
      .where('id', employeeFixture.output.id)
    const row = tuples[0]
    expect(row.name).toEqual(newName)

    await database('user').where('id', employeeFixture.output.id).del()
  })

  it('should succeed when list all users', async () => {
    const userA = await insertUserIntoDatabase(database)
    const userB = await insertUserIntoDatabase(database)
    const response = await request(server)
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
