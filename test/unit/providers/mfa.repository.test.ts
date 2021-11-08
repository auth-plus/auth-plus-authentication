import { expect } from 'chai'
import faker from 'faker'

import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { CreatingMFAErrorsTypes } from '../../../src/core/usecases/driven/creating_mfa.driven'

describe('mfa repository', () => {
  const mockName = faker.name.findName()
  const mockEmail = faker.internet.email(mockName.split(' ')[0])
  let mockUserId: string
  const strategy = Strategy.EMAIL
  before(async () => {
    const row: string[] = await database('user')
      .insert({
        name: mockName,
        email: mockEmail,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    mockUserId = row[0]
  })
  after(async () => {
    await database('user').where('id', mockUserId).del()
  })
  it('should succeed when creating a strategy for user', async () => {
    const mFARepository = new MFARepository()
    const result = await mFARepository.creatingStrategyForUser(
      mockName,
      mockUserId,
      strategy
    )
    expect(result).to.be.a('string')
    await database('multi_factor_authentication').where('id', result).del()
  })
  it('should fail when creating a strategy for user', async () => {
    const row: string[] = await database('multi_factor_authentication')
      .insert({
        name: mockName,
        user_id: mockUserId,
        strategy,
      })
      .returning('id')
    const id = row[0]
    const mFARepository = new MFARepository()
    try {
      await mFARepository.creatingStrategyForUser(
        mockName,
        mockUserId,
        strategy
      )
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreatingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
      await database('multi_factor_authentication').where('id', id).del()
    }
  })
  it('should succeed when finding a mfa by userId', async () => {
    const row: string[] = await database('multi_factor_authentication')
      .insert({
        name: mockName,
        user_id: mockUserId,
        strategy,
        is_enable: true,
      })
      .returning('id')
    const id = row[0]
    const mFARepository = new MFARepository()
    const result = await mFARepository.findMFAByUserId(mockUserId)
    expect(result[0]).to.eql(strategy)
    await database('multi_factor_authentication').where('id', id).del()
  })
  it('should succeed when validating a mfa', async () => {
    const row: string[] = await database('multi_factor_authentication')
      .insert({
        name: mockName,
        user_id: mockUserId,
        strategy,
        is_enable: true,
      })
      .returning('id')
    const mfaId = row[0]
    const mFARepository = new MFARepository()
    const result = await mFARepository.validate(mfaId)
    expect(result).to.eql(true)
    await database('multi_factor_authentication').where('id', mfaId).del()
  })
  it('should fail when validating a mfa', async () => {
    const mFARepository = new MFARepository()
    const result = await mFARepository.validate(faker.datatype.uuid())
    expect(result).to.eql(false)
  })
})
