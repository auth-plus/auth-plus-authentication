import casual from 'casual'
import { expect } from 'chai'

import database from '../../../src/core/config/database'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { SendingMfaCodeErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('notification provider', () => {
  it('should succeed when sending email', async () => {
    const userResult = await insertUserIntoDatabase()
    const mockCode = casual.array_of_digits(6).join('')

    const notificationProvider = new NotificationProvider()
    const result = await notificationProvider.sendCodeByEmail(
      userResult.output.id,
      mockCode
    )
    expect(result).to.be.undefined

    await database('user').where('id', userResult.output.id).del()
  })
  it('should fail when not finding a user', async () => {
    const mockCode = casual.array_of_digits(6).join('')

    const notificationProvider = new NotificationProvider()
    try {
      await notificationProvider.sendCodeByEmail(casual.uuid, mockCode)
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

    const notificationProvider = new NotificationProvider()
    const result = await notificationProvider.sendCodeByPhone(
      userResult.output.id,
      mockCode
    )
    expect(result).to.be.undefined

    await database('user_info').where('id', userInfoResult.output.id).del()
    await database('user').where('id', userResult.output.id).del()
  })
  it('should fail when sending sms but not finding a user phone', async () => {
    const userResult = await insertUserIntoDatabase()
    const mockCode = casual.array_of_digits(6).join('')

    const notificationProvider = new NotificationProvider()
    try {
      await notificationProvider.sendCodeByPhone(userResult.output.id, mockCode)
    } catch (error) {
      expect((error as Error).message).to.eql(
        SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND
      )
    }
    await database('user').where('id', userResult.output.id).del()
  })
})
