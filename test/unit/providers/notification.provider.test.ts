import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import database from '../../../src/core/config/database'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { EmailService } from '../../../src/core/services/email.service'
import { SendingMfaCodeErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_code.driven'

describe('notification provider', () => {
  const mockEmail = faker.internet.email()
  const mockCode = faker.datatype.number(6).toString()
  let id: string
  before(async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: '',
        email: mockEmail,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0].id
  })
  after(async () => {
    await database('user').where('id', id).del()
  })
  it('should succeed when creating a mfa hash', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, mockCode)).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const notificationProvider = new NotificationProvider(emailService)
    await notificationProvider.sendByEmail(id, mockCode)
    verify(mockEmailService.send(mockEmail, mockCode)).once()
  })
  it('should fail when not finding a user', async () => {
    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(mockEmail, mockCode)).thenReject()
    const emailService: EmailService = instance(mockEmailService)

    const notificationProvider = new NotificationProvider(emailService)
    try {
      await notificationProvider.sendByEmail(id, mockCode)
    } catch (error) {
      expect((error as Error).message).to.eql(
        SendingMfaCodeErrorsTypes.USER_NOT_FOUND
      )
    }
  })
})