import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { genSaltSync, hash } from 'bcrypt'
import casual from 'casual'
import { Knex } from 'knex'
import { mock, instance, when, verify, deepEqual, anything } from 'ts-mockito'

import {
  UserInfoRow,
  UserRepository,
  UserRow,
} from '../../../src/core/providers/user.repository'
import { PasswordService } from '../../../src/core/services/password.service'
import { CreatingUserErrorsTypes } from '../../../src/core/usecases/driven/creating_user.driven'
import { FindingUserErrorsTypes } from '../../../src/core/usecases/driven/finding_user.driven'
import { deviceIdGenerator, passwordGenerator } from '../../fixtures/generators'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('user repository', () => {
  const mockName = casual.full_name
  const mockEmail = casual.email.toLowerCase()
  const mockPassword = passwordGenerator()
  let pgSqlContainer: StartedPostgreSqlContainer

  let database: Knex

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer().start()
    database = await setupDB(pgSqlContainer)
  })

  beforeEach(async () => {
    await database('multi_factor_authentication').del()
    await database('user_info').del()
    await database('user').del()
  })

  afterAll(async () => {
    await pgSqlContainer.stop()
  })

  it('should succeed when finding a user by email and password', async () => {
    const userFixture = await insertUserIntoDatabase(database, {
      name: mockName,
      email: mockEmail,
      password: mockPassword,
    })
    const userId = userFixture.output.id
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).thenResolve(true)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    const result = await userRepository.findUserByEmailAndPassword(
      mockEmail,
      mockPassword
    )
    expect(result.email).toEqual(mockEmail)
    expect(result.name).toEqual(mockName)
    expect(result.id).toEqual(userId)
    verify(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).once()
  })

  it('should fail when finding a user by email and password', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, anything())).thenResolve(
      false
    )
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    await expect(
      userRepository.findUserByEmailAndPassword(mockEmail, mockPassword)
    ).rejects.toThrow(FindingUserErrorsTypes.USER_NOT_FOUND)
    verify(mockPasswordService.compare(mockPassword, anything())).never()
  })
  it('should succeed when finding a user by id', async () => {
    const userFixture = await insertUserIntoDatabase(database, {
      name: mockName,
      email: mockEmail,
      password: mockPassword,
    })
    const userId = userFixture.output.id
    await insertUserInfoIntoDatabase(database, {
      userId,
      type: 'phone',
      value: casual.phone,
    })
    await insertUserInfoIntoDatabase(database, {
      userId,
      type: 'deviceId',
      value: casual.uuid,
    })
    await insertUserInfoIntoDatabase(database, {
      userId,
      type: 'ga',
      value: casual.uuid,
    })

    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).thenResolve()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    const result = await userRepository.findById(userId)
    expect(result.email).toEqual(mockEmail)
    expect(result.name).toEqual(mockName)
    expect(result.id).toEqual(userId)
    verify(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).never()
  })
  it('should fail when finding a user by id', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, anything())).thenReject()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    await expect(userRepository.findById(casual.uuid)).rejects.toThrow(
      FindingUserErrorsTypes.USER_NOT_FOUND
    )
  })
  it('should succeed when creating a user', async () => {
    const mockHash = await hash(mockPassword, genSaltSync(12))
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).thenReturn(true)
    when(mockPasswordService.generateHash(mockPassword)).thenResolve(mockHash)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    const result = await userRepository.create(
      mockName,
      mockEmail,
      mockPassword
    )
    expect(typeof result).toBe('string')
    verify(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).once()
    verify(mockPasswordService.generateHash(mockPassword)).once()
  })
  it('should fail when creating a user with weak password', async () => {
    const mockHash = await hash(mockPassword, genSaltSync(12))
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).thenReturn(false)
    when(mockPasswordService.generateHash(mockPassword)).thenResolve(mockHash)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, emailService)
    await expect(
      userRepository.create(mockName, mockEmail, mockPassword)
    ).rejects.toThrow(CreatingUserErrorsTypes.PASSWORD_LOW_ENTROPY)
    verify(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).once()
    verify(mockPasswordService.generateHash(mockPassword)).never()
  })
  it('should succeed when updating a user name', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const newName = casual.full_name

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateName(
      userFixture.output.id,
      newName
    )

    expect(result).toEqual(true)
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].name).toEqual(newName)
  })
  it('should succeed when updating a user email', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const newEmail = casual.email.toLowerCase()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateEmail(
      userFixture.output.id,
      newEmail
    )

    expect(result).toEqual(true)
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].email).toEqual(newEmail)
  })
  it('should succeed when updating a user phone when exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const userInfoFixture = await insertUserInfoIntoDatabase(database, {
      userId: userFixture.output.id,
      type: 'phone',
      value: casual.phone,
    })
    const newPhone = casual.phone

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newPhone)
  })
  it('should succeed when updating a user phone when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const newPhone = casual.phone

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).toEqual(newPhone)
  })
  it('should succeed when updating a user device when exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const userInfoFixture = await insertUserInfoIntoDatabase(database, {
      userId: userFixture.output.id,
      type: 'deviceId',
      value: casual.uuid,
    })
    const newDeviceId = deviceIdGenerator()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newDeviceId)
  })
  it('should succeed when updating a user device when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const newDeviceId = deviceIdGenerator()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('type', 'deviceId')
      .andWhere('value', newDeviceId)
    expect(response[0].value).toEqual(newDeviceId)
  })
  it('should succeed when updating a user GA when exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const userInfoFixture = await insertUserInfoIntoDatabase(database, {
      userId: userFixture.output.id,
      type: 'ga',
      value: casual.uuid,
    })
    const newGA = casual.uuid

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newGA)
  })
  it('should succeed when updating a user GA when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const newGA = casual.uuid

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).toEqual(newGA)
  })

  it('should succeed when listing all users', async () => {
    const userFixture = await insertUserIntoDatabase(database)
    const user2Fixture = await insertUserIntoDatabase(database)

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(database, passwordService)
    const result = await userRepository.getAll()

    expect(result.length).toEqual(2)
    expect(result.map((e) => e.id).sort()).toEqual(
      [userFixture.output.id, user2Fixture.output.id].sort()
    )
  })
})
