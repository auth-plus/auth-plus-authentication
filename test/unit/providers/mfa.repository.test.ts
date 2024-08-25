import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import casual from 'casual'
import { Knex } from 'knex'
import { instance, mock, verify, anything, when } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingMFAErrorType } from '../../../src/core/usecases/driven/creating_mfa.driven'
import { FindingMFAErrorsTypes } from '../../../src/core/usecases/driven/finding_mfa.driven'
import { UpdatingUser } from '../../../src/core/usecases/driven/updating_user.driven'
import { passwordGenerator } from '../../fixtures/generators'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('mfa repository', () => {
  const mockName = casual.full_name
  const mockPhone = casual.phone
  const mockEmail = casual.email.toLowerCase()
  const mockPassword = passwordGenerator()

  let mockUserId: string
  let user: User
  let pgSqlContainer: StartedPostgreSqlContainer
  let database: Knex

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer().start()
    database = await setupDB(pgSqlContainer)
    const userFixture = await insertUserIntoDatabase(database, {
      name: mockName,
      email: mockEmail,
      password: mockPassword,
    })
    mockUserId = userFixture.output.id
    user = {
      id: mockUserId,
      email: mockEmail,
      name: mockName,
      info: {
        deviceId: null,
        googleAuth: null,
        phone: mockPhone,
      },
    }
  })

  afterAll(async () => {
    await pgSqlContainer.stop()
  })

  beforeEach(async () => {
    await database('multi_factor_authentication').truncate()
  })

  it('should succeed when creating a strategy email for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.EMAIL
    )
    expect(typeof result.id).toBe('string')
    expect(result.userId).toEqual(user.id)
    expect(result.strategy).toEqual(Strategy.EMAIL)
    verify(mockUpdatingUser.updateEmail(anything(), anything())).never()
  })

  it('should succeed when creating a strategy phone for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.PHONE
    )
    expect(typeof result.id).toBe('string')
    expect(result.userId).toEqual(user.id)
    expect(result.strategy).toEqual(Strategy.PHONE)
    verify(mockUpdatingUser.updatePhone(anything(), anything())).never()
  })

  it('should succeed when creating a strategy GA for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    when(mockUpdatingUser.updateGA(user.id, anything())).thenResolve()
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.GA
    )
    expect(typeof result.id).toBe('string')
    expect(result.userId).toEqual(user.id)
    expect(result.strategy).toEqual(Strategy.GA)
    verify(mockUpdatingUser.updateGA(user.id, anything())).once()
  })

  it('should fail when creating a strategy for user because already exist', async () => {
    await insertMfaIntoDatabase(database, {
      userId: mockUserId,
      strategy: Strategy.EMAIL,
    })
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    await expect(
      mFARepository.creatingStrategyForUser(user, Strategy.EMAIL)
    ).rejects.toThrow(CreatingMFAErrorType.MFA_ALREADY_EXIST)
  })

  it('should succeed when finding a mfa by userId', async () => {
    const mfaFixture = await insertMfaIntoDatabase(database, {
      userId: mockUserId,
      strategy: Strategy.EMAIL,
    })
    const id = mfaFixture.output.id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.findMfaListByUserId(mockUserId)
    expect(result[0].strategy).toEqual(Strategy.EMAIL)
    expect(result[0].id).toEqual(id)
  })

  it('should succeed when validating a mfa', async () => {
    const mfaFixture = await insertMfaIntoDatabase(database, {
      userId: mockUserId,
      strategy: Strategy.EMAIL,
    })
    const mfaId = mfaFixture.output.id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.validate(mfaId)
    expect(result).toEqual(true)
  })

  it('should fail when validating a mfa', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.validate(casual.uuid)
    expect(result).toEqual(false)
  })

  it('should succeed when finding a mfa by user id and strategy', async () => {
    const mfaFixture = await insertMfaIntoDatabase(database, {
      userId: mockUserId,
      strategy: Strategy.EMAIL,
    })
    const mfaId = mfaFixture.output.id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    const result = await mFARepository.findMFAByUserIdAndStrategy(
      mockUserId,
      Strategy.EMAIL
    )
    expect(result.id).toEqual(mfaId)
    expect(result.strategy).toEqual(Strategy.EMAIL)
    expect(result.userId).toEqual(mockUserId)
  })

  it('should fail when finding a mfa by user id and strategy', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(database, updatingUser)
    await expect(
      mFARepository.findMFAByUserIdAndStrategy(mockUserId, Strategy.EMAIL)
    ).rejects.toThrow(FindingMFAErrorsTypes.MFA_NOT_FOUND)
  })
})
