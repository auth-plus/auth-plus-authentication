import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify, anyString } from 'ts-mockito'

import database from '../../../src/core/config/database'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { EmailService } from '../../../src/core/services/email.service'
import { InvalidatingTokenErrorsTypes } from '../../../src/core/usecases/driven/invalidating_token.driven'

describe('token repository', () => {
  const mockName = faker.name.findName()
  const mockEmail = faker.internet.email(mockName.split(' ')[0])
  const mockValue = faker.datatype.string(64)
  let mockUserId: string
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
  it('should succeed when invalidating a token', async () => {
    const row: string[] = await database('token')
      .insert({
        value: mockValue,
        user_id: mockUserId,
        is_enable: true,
      })
      .returning('id')
    const mockTokenId = row[0]

    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, anyString())).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const tokenRepository = new TokenRepository(emailService)
    await tokenRepository.invalidate(mockValue)
    verify(mockEmailService.send(mockEmail, anyString())).never()
    await database('token').where('id', mockTokenId).del()
  })
  it('should succeed when invalidating all token for user', async () => {
    const row: string[] = await database('token')
      .insert({
        value: mockValue,
        user_id: mockUserId,
        is_enable: true,
      })
      .returning('id')
    const mockTokenId = row[0]

    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, anyString())).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const tokenRepository = new TokenRepository(emailService)
    await tokenRepository.invalidate(mockValue, {
      id: mockUserId,
      email: mockEmail,
      name: mockName,
    })
    verify(mockEmailService.send(mockEmail, anyString())).once()
    await database('token').where('id', mockTokenId).del()
  })
  it('should fail when invalidating a token for user by not finding', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, anyString())).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const tokenRepository = new TokenRepository(emailService)
    try {
      await tokenRepository.invalidate(mockValue, {
        id: mockUserId,
        email: mockEmail,
        name: mockName,
      })
    } catch (error) {
      expect((error as Error).message).to.eql(
        InvalidatingTokenErrorsTypes.PROVIDER_ERROR
      )
    }
  })
  it('should fail when invalidating a token for user by emailService', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, anyString())).thenReject()
    const emailService: EmailService = instance(mockEmailService)

    const tokenRepository = new TokenRepository(emailService)
    try {
      await tokenRepository.invalidate(mockValue, {
        id: mockUserId,
        email: mockEmail,
        name: mockName,
      })
    } catch (error) {
      expect((error as Error).message).to.eql(
        InvalidatingTokenErrorsTypes.PROVIDER_ERROR
      )
    }
  })
})
