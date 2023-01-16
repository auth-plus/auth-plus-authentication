import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  CreatingMFA,
  CreatingMFAError,
  CreatingMFAErrorType,
} from '../../../src/core/usecases/driven/creating_mfa.driven'
import { FindingMFA } from '../../../src/core/usecases/driven/finding_mfa.driven'
import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import { SendingMfaHash } from '../../../src/core/usecases/driven/sending_mfa_hash.driven'
import { ValidatingMFA } from '../../../src/core/usecases/driven/validating_mfa.driven'
import { CreateMFAErrorsTypes } from '../../../src/core/usecases/driver/create_mfa.driver'
import { ListMFAErrorsTypes } from '../../../src/core/usecases/driver/list_mfa.driver'
import { ValidateMFAErrorsTypes } from '../../../src/core/usecases/driver/validate_mfa.driver'
import MFA from '../../../src/core/usecases/mfa.usecase'

describe('mfa usecase', function () {
  const mfaId = casual.uuid
  const phone = casual.phone
  const user: User = {
    id: casual.uuid,
    name: casual.full_name,
    email: casual.email.toLowerCase(),
    info: {
      deviceId: null,
      googleAuth: null,
      phone: phone,
    },
  }
  const strategy = Strategy.EMAIL
  it('should succeed when creating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenResolve({
      id: mfaId,
      strategy,
      userId: user.id,
    })
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    when(mockSendingMfaHash.sendMfaHashByEmail(user.id, mfaId)).thenResolve()
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const mFA = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )

    await mFA.create(user.id, strategy)

    verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
    verify(mockSendingMfaHash.sendMfaHashByEmail(user.id, mfaId)).once()
    verify(mockValidatingMFA.validate(anything())).never()
    verify(mockFindingMFA.findMfaListByUserId(anything())).never()
  })
  it('should fail when creating a mfa with user not found', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenReject(
      new FindingUserErrors(FindingUserErrorsTypes.USER_NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const mFA = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(
        mockCreatingMFA.creatingStrategyForUser(anything(), anything())
      ).never()
      verify(mockValidatingMFA.validate(anything())).never()
      verify(mockFindingMFA.findMfaListByUserId(anything())).never()
      verify(mockSendingMfaHash.sendMfaHashByEmail(user.id, mfaId)).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.USER_NOT_FOUND
      )
    }
  })
  it('should fail when creating a mfa with mfa already exist', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenReject(
      new CreatingMFAError(CreatingMFAErrorType.MFA_ALREADY_EXIST)
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const mFA = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
      verify(mockValidatingMFA.validate(anything())).never()
      verify(mockFindingMFA.findMfaListByUserId(anything())).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.ALREADY_EXIST
      )
    }
  })
  it('should fail when creating a mfa=PHONE but user_info does not exist', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenReject(
      new CreatingMFAError(CreatingMFAErrorType.MFA_INFO_NOT_EXIST)
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const mFA = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
      verify(mockValidatingMFA.validate(anything())).never()
      verify(mockFindingMFA.findMfaListByUserId(anything())).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.INFO_NOT_EXIST
      )
    }
  })
  it('should succeed when validating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const testClass = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    const response = await testClass.validate(mfaId)

    verify(mockValidatingMFA.validate(mfaId)).once()
    expect(response).to.eql(true)
  })
  it('should fail when validating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenReject(
      new Error('mfa does not exist')
    )
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const testClass = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await testClass.validate(mfaId)
    } catch (error) {
      verify(mockValidatingMFA.validate(mfaId)).once()
      expect((error as Error).message).to.eql(
        ValidateMFAErrorsTypes.DEPENDECY_ERROR
      )
    }
  })
  it('should succeed when listing a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(user.id)).thenResolve([
      { id: casual.uuid, strategy: Strategy.PHONE },
    ])
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const testClass = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    const response = await testClass.list(user.id)

    verify(mockFindingUser.findById(user.id)).once()
    verify(mockFindingMFA.findMfaListByUserId(user.id)).once()
    expect(response).to.eql([Strategy.PHONE])
  })
  it('should fail when listing a mfa not found user', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenReject(
      new FindingUserErrors(FindingUserErrorsTypes.USER_NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const testClass = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await testClass.list(user.id)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      expect((error as Error).message).to.eql(ListMFAErrorsTypes.USER_NOT_FOUND)
    }
  })
  it('should fail when listing a mfa not found user', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(user.id)).thenReject(
      new Error('Unmapped Error')
    )
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mockSendingMfaHash: SendingMfaHash = mock(NotificationProvider)
    const sendingMfaHash: SendingMfaHash = instance(mockSendingMfaHash)

    const testClass = new MFA(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    )
    try {
      await testClass.list(user.id)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      expect((error as Error).message).to.eql(
        ListMFAErrorsTypes.DEPENDECY_ERROR
      )
    }
  })
})
