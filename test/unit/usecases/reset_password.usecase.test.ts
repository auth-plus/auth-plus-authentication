import casual from 'casual'
import { anything, instance, mock, verify, when } from 'ts-mockito'

import { User } from '../../../src/core/entities/user'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { ResetPasswordRepository } from '../../../src/core/providers/reset_password.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingResetPassword } from '../../../src/core/usecases/driven/creating_reset_password.driven'
import { FindingResetPassword } from '../../../src/core/usecases/driven/finding_reset_password.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { SendingResetEmail } from '../../../src/core/usecases/driven/sending_reset_email.driven'
import { UpdatingUser } from '../../../src/core/usecases/driven/updating_user.driven'
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
    await testClass.forget(user.email)
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
    await testClass.recover(newPassword, hash)
    verify(mockCreatingResetPassword.create(anything())).never()
    verify(mockSendingResetEmail.sendEmail(anything(), anything())).never()
    verify(mockFindingResetPassword.findByHash(anything())).never()
    verify(mockFindingUser.findByEmail(anything())).never()
    verify(mockUpdatingUser.updatePassword(anything(), anything())).never()
  })
})
