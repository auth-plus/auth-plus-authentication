import { expect } from 'chai'
import faker from 'faker'
import { instance, mock, verify, anything, when } from 'ts-mockito'

import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingMFAErrorType } from '../../../src/core/usecases/driven/creating_mfa.driven'
import { FindingMFAErrorsTypes } from '../../../src/core/usecases/driven/finding_mfa.driven'
import { UpdatingUser } from '../../../src/core/usecases/driven/updating_user.driven'

describe('mfa repository', () => {
  const mockName = faker.name.findName()
  const mockPhone = faker.phone.phoneNumber()
  const mockEmail = faker.internet.email(mockName.split(' ')[0])
  let mockUserId: string
  let user: User

  before(async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: mockName,
        email: mockEmail,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    mockUserId = row[0].id
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
  after(async () => {
    await database('multi_factor_authentication')
      .where('user_id', mockUserId)
      .del()
    await database('user').where('id', mockUserId).del()
  })
  it('should succeed when creating a strategy email for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.EMAIL
    )
    expect(result).to.be.a('string')
    verify(mockUpdatingUser.updateEmail(anything(), anything())).never()
    await database('multi_factor_authentication').where('id', result).del()
  })
  it('should succeed when creating a strategy phone for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.PHONE
    )
    expect(result).to.be.a('string')
    verify(mockUpdatingUser.updatePhone(anything(), anything())).never()
    await database('multi_factor_authentication').where('id', result).del()
  })
  it('should succeed when creating a strategy GA for user', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    when(mockUpdatingUser.updateGA(user.id, anything())).thenResolve()
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.creatingStrategyForUser(
      user,
      Strategy.GA
    )
    expect(result).to.be.a('string')
    verify(mockUpdatingUser.updateGA(user.id, anything())).once()
    await database('multi_factor_authentication').where('id', result).del()
  })
  it('should fail when creating a strategy for user because already exist', async () => {
    const row: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        user_id: mockUserId,
        strategy: Strategy.EMAIL,
      })
      .returning('id')
    const id = row[0].id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(updatingUser)
    try {
      await mFARepository.creatingStrategyForUser(user, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreatingMFAErrorType.ALREADY_EXIST
      )
      await database('multi_factor_authentication').where('id', id).del()
    }
  })
  it('should succeed when finding a mfa by userId', async () => {
    const row: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        user_id: mockUserId,
        strategy: Strategy.EMAIL,
        is_enable: true,
      })
      .returning('id')
    const id = row[0].id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.findMFAListByUserId(mockUserId)
    expect(result[0].strategy).to.eql(Strategy.EMAIL)
    expect(result[0].id).to.eql(id)
    await database('multi_factor_authentication').where('id', id).del()
  })
  it('should succeed when validating a mfa', async () => {
    const row: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        user_id: mockUserId,
        strategy: Strategy.EMAIL,
        is_enable: true,
      })
      .returning('id')
    const mfaId = row[0].id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.validate(mfaId)
    expect(result).to.eql(true)
    await database('multi_factor_authentication').where('id', mfaId).del()
  })
  it('should fail when validating a mfa', async () => {
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.validate(faker.datatype.uuid())
    expect(result).to.eql(false)
  })
  it('should succeed when finding a mfa by user id and strategy', async () => {
    const row: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        user_id: mockUserId,
        strategy: Strategy.EMAIL,
        is_enable: true,
      })
      .returning('id')
    const mfaId = row[0].id
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const mFARepository = new MFARepository(updatingUser)
    const result = await mFARepository.findMFAByUserIdAndStrategy(
      mockUserId,
      Strategy.EMAIL
    )
    expect(result.id).to.eql(mfaId)
    expect(result.strategy).to.eql(Strategy.EMAIL)
    expect(result.userId).to.eql(mockUserId)
    await database('multi_factor_authentication').where('id', mfaId).del()
  })
  it('should fail when finding a mfa by user id and strategy', async () => {
    try {
      const mockUpdatingUser: UpdatingUser = mock(UserRepository)
      const updatingUser: UpdatingUser = instance(mockUpdatingUser)
      const mFARepository = new MFARepository(updatingUser)
      await mFARepository.findMFAByUserIdAndStrategy(mockUserId, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.be.equal(
        FindingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  })
})
