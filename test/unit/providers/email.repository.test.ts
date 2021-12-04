import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import database from '../../../src/core/config/database'
import { EmailRepository } from '../../../src/core/providers/email.repository'
import { EmailService } from '../../../src/core/services/email.service'
import { NotificationErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_code.driven'

describe('email repository', () => {
  const mockEmail = faker.internet.email()
  const mockCode = faker.datatype.number(6).toString()
  let id: string
  before(async () => {
    const row: string[] = await database('user')
      .insert({
        name: '',
        email: mockEmail,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0]
  })
  after(async () => {
    await database('user').where('id', id).del()
  })
  it('should succeed when creating a mfa hash', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, mockCode)).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const emailRepository = new EmailRepository(emailService)
    await emailRepository.sendCodeForUser(id, mockCode)
    verify(mockEmailService.send(mockEmail, mockCode)).once()
  })
  it('should fail when not finding a user', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, mockCode)).thenReject()
    const emailService: EmailService = instance(mockEmailService)

    const emailRepository = new EmailRepository(emailService)
    try {
      await emailRepository.sendCodeForUser(id, mockCode)
    } catch (error) {
      expect((error as Error).message).to.eql(
        NotificationErrorsTypes.PROVIDER_ERROR
      )
    }
  })
})
