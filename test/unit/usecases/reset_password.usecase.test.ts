import { describe, expect, it } from '@jest/globals'
import casual from 'casual'
import { anything, instance, mock, verify, when } from 'ts-mockito'

import { User } from '../../../src/core/entities/user'
import { NotificationProvider } from '../../../src/adapters/outbound/notification.provider'
import { ResetPasswordRepository } from '../../../src/adapters/outbound/reset_password.repository'
import { UserRepository } from '../../../src/adapters/outbound/user.repository'
import { CreatingResetPassword } from '../../../src/core/driven/creating_reset_password.driven'
import { FindingResetPassword } from '../../../src/core/driven/finding_reset_password.driven'
import { FindingUser } from '../../../src/core/driven/finding_user.driven'
import { SendingResetEmail } from '../../../src/core/driven/sending_reset_email.driven'
import { UpdatingUser } from '../../../src/core/driven/updating_user.driven'
import ResetPasswordUseCase from '../../../src/core/usecases/reset_password.usecase'

describe('reset password usecase', () => {
  const hash = casual.uuid
  const userId = casual.uuid
  const user: User = {
    id: userId,
    name: casual.name,
    email: casual.email,
    info: {
      deviceId: casual.uuid,
      googleAuth: casual.uuid,
      phone: casual.phone,
    },
  }
  it('should succeed when user forget password', async () => {
    const mockCreatingResetPassword: CreatingResetPassword = mock(
      ResetPasswordRepository
    )
    when(mockCreatingResetPassword.create(user.email)).thenResolve(hash)
    const creatingResetPassword: CreatingResetPassword = instance(
      mockCreatingResetPassword
    )
    const mockSendingResetEmail: SendingResetEmail = mock(NotificationProvider)
    when(mockSendingResetEmail.sendEmail(user.email, hash)).thenResolve()
    const sendingResetEmail: SendingResetEmail = instance(mockSendingResetEmail)
    const mockFindingResetPassword: FindingResetPassword = mock(
      ResetPasswordRepository
    )
    const findingResetPassword: FindingResetPassword = instance(
      mockFindingResetPassword
    )
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const testClass = new ResetPasswordUseCase(
      creatingResetPassword,
      sendingResetEmail,
      findingResetPassword,
      findingUser,
      updatingUser
    )
    const result = await testClass.forget(user.email)
    expect(result).toBeUndefined()
    verify(mockCreatingResetPassword.create(user.email)).once()
    verify(mockSendingResetEmail.sendEmail(user.email, hash)).once()
    verify(mockFindingResetPassword.findByHash(anything())).never()
    verify(mockFindingUser.findByEmail(anything())).never()
    verify(mockUpdatingUser.updatePassword(anything(), anything())).never()
  })

  it('should succeed when user try to recover password', async () => {
    const newPassword = casual.password
    const mockCreatingResetPassword: CreatingResetPassword = mock(
      ResetPasswordRepository
    )
    const creatingResetPassword: CreatingResetPassword = instance(
      mockCreatingResetPassword
    )
    const mockSendingResetEmail: SendingResetEmail = mock(NotificationProvider)
    const sendingResetEmail: SendingResetEmail = instance(mockSendingResetEmail)
    const mockFindingResetPassword: FindingResetPassword = mock(
      ResetPasswordRepository
    )
    when(mockFindingResetPassword.findByHash(hash)).thenResolve(user.email)
    const findingResetPassword: FindingResetPassword = instance(
      mockFindingResetPassword
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findByEmail(user.email)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)
    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    when(mockUpdatingUser.updatePassword(user, newPassword)).thenResolve()
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)
    const testClass = new ResetPasswordUseCase(
      creatingResetPassword,
      sendingResetEmail,
      findingResetPassword,
      findingUser,
      updatingUser
    )
    const result = await testClass.recover(newPassword, hash)
    expect(result).toBeUndefined()
    verify(mockCreatingResetPassword.create(anything())).never()
    verify(mockSendingResetEmail.sendEmail(anything(), anything())).never()
    verify(mockFindingResetPassword.findByHash(anything())).once()
    verify(mockFindingUser.findByEmail(anything())).once()
    verify(mockUpdatingUser.updatePassword(anything(), anything())).once()
  })
})
