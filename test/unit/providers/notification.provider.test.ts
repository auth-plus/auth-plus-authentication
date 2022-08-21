import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify, anyString, anything } from 'ts-mockito'

import database from '../../../src/core/config/database'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { EmailService } from '../../../src/core/services/email.service'
import { SmsService } from '../../../src/core/services/sms.service'
import { SendingMfaCodeErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('notification provider', () => {
  it('should succeed when sending email', async () => {
    const userResult = await insertUserIntoDatabase()
    const mockCode = casual.array_of_digits(6).join('')

    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(userResult.input.email, mockCode)).thenResolve()
    const emailService: EmailService = instance(mockEmailService)

    const mockSmsService: SmsService = mock(SmsService)
    const smsService: EmailService = instance(mockSmsService)

    const notificationProvider = new NotificationProvider(
      emailService,
      smsService
    )
    await notificationProvider.sendByEmail(userResult.output.id, mockCode)
    verify(mockEmailService.send(userResult.input.email, mockCode)).once()

    await database('user').where('id', userResult.output.id).del()
  })
  it('should fail when not finding a user', async () => {
    const mockCode = casual.array_of_digits(6).join('')

    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(anything(), mockCode)).thenReject()
    const emailService: EmailService = instance(mockEmailService)

    const mockSmsService: SmsService = mock(SmsService)
    const smsService: EmailService = instance(mockSmsService)

    const notificationProvider = new NotificationProvider(
      emailService,
      smsService
    )
    try {
      await notificationProvider.sendByEmail(casual.uuid, mockCode)
    } catch (error) {
      expect((error as Error).message).to.eql(
        SendingMfaCodeErrorsTypes.USER_NOT_FOUND
      )
    }
  })
  it('should succeed when sending sms', async () => {
    const mockPhone = casual.phone
    const mockCode = casual.array_of_digits(6).join('')
    const userResult = await insertUserIntoDatabase()
    const userInfoResult = await insertUserInfoIntoDatabase(
      userResult.output.id,
      'phone',
      mockPhone
    )

    const mockEmailService: EmailService = mock(EmailService)
    const emailService: EmailService = instance(mockEmailService)

    const mockSmsService: SmsService = mock(SmsService)
    when(mockSmsService.send(mockPhone, mockCode)).thenResolve()
    const smsService: EmailService = instance(mockSmsService)

    const notificationProvider = new NotificationProvider(
      emailService,
      smsService
    )
    await notificationProvider.sendBySms(userResult.output.id, mockCode)
    verify(mockSmsService.send(mockPhone, mockCode)).once()

    await database('user_info').where('id', userInfoResult.output.id).del()
    await database('user').where('id', userResult.output.id).del()
  })
  it('should fail when sending sms but not finding a user phone', async () => {
    const userResult = await insertUserIntoDatabase()
    const mockCode = casual.array_of_digits(6).join('')

    const mockEmailService: EmailService = mock(EmailService)
    when(mockEmailService.send(userResult.input.email, mockCode)).thenReject()
    const emailService: EmailService = instance(mockEmailService)

    const mockSmsService: SmsService = mock(SmsService)
    const smsService: EmailService = instance(mockSmsService)

    const notificationProvider = new NotificationProvider(
      emailService,
      smsService
    )
    try {
      await notificationProvider.sendBySms(anyString(), mockCode)
    } catch (error) {
      expect((error as Error).message).to.eql(
        SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND
      )
    }
    await database('user').where('id', userResult.output.id).del()
  })
})
