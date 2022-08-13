import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  CreatingMFA,
  CreatingMFAError,
  CreatingMFAErrorType,
} from '../../../src/core/usecases/driven/creating_mfa.driven'
import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import { ValidatingMFA } from '../../../src/core/usecases/driven/validating_mfa.driven'
import { CreateMFAErrorsTypes } from '../../../src/core/usecases/driver/create_mfa.driver'
import { ValidateMFAErrorsTypes } from '../../../src/core/usecases/driver/validate_mfa.driver'
import MFA from '../../../src/core/usecases/mfa.usecase'

describe('mfa usecase', function () {
  const mfaId = faker.datatype.number(6).toString()
  const phone = faker.phone.phoneNumber()
  const user: User = {
    id: faker.datatype.uuid(),
    name: faker.name.findName(),
    email: faker.internet.email(),
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

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenResolve({
      id: mfaId,
      strategy,
      userId: user.id,
    })
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mFA = new MFA(findingUser, creatingMFA, validatingMFA)
    const response = await mFA.create(user.id, strategy)

    verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
    verify(mockValidatingMFA.validate(anything())).never()
    expect(response).to.eql(mfaId)
  })
  it('should fail when creating a mfa with user not found', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenReject(
      new FindingUserErrors(FindingUserErrorsTypes.USER_NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mFA = new MFA(findingUser, creatingMFA, validatingMFA)
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(
        mockCreatingMFA.creatingStrategyForUser(anything(), anything())
      ).never()
      verify(mockValidatingMFA.validate(anything())).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.USER_NOT_FOUND
      )
    }
  })
  it('should fail when creating a mfa with mfa already exist', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenReject(
      new CreatingMFAError(CreatingMFAErrorType.MFA_ALREADY_EXIST)
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mFA = new MFA(findingUser, creatingMFA, validatingMFA)
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
      verify(mockValidatingMFA.validate(anything())).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.ALREADY_EXIST
      )
    }
  })
  it('should fail when creating a mfa=PHONE but user_info does not exist', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenReject(
      new CreatingMFAError(CreatingMFAErrorType.MFA_INFO_NOT_EXIST)
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mFA = new MFA(findingUser, creatingMFA, validatingMFA)
    try {
      await mFA.create(user.id, strategy)
    } catch (error) {
      verify(mockFindingUser.findById(user.id)).once()
      verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
      verify(mockValidatingMFA.validate(anything())).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.INFO_NOT_EXIST
      )
    }
  })
  it('should succeed when validating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(findingUser, creatingMFA, validatingMFA)
    const response = await testClass.validate(mfaId)

    verify(mockValidatingMFA.validate(mfaId)).once()
    expect(response).to.eql(true)
  })
  it('should fail when validating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenReject(
      new Error('mfa does not exist')
    )
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(findingUser, creatingMFA, validatingMFA)
    try {
      await testClass.validate(mfaId)
    } catch (error) {
      verify(mockValidatingMFA.validate(mfaId)).once()
      expect((error as Error).message).to.eql(
        ValidateMFAErrorsTypes.DEPENDECY_ERROR
      )
    }
  })
})
