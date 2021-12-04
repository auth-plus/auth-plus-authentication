import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  CreatingMFA,
  CreatingMFAErrorsTypes,
} from '../../../src/core/usecases/driven/creating_mfa.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { ValidatingMFA } from '../../../src/core/usecases/driven/validating_mfa.driven'
import { CreateMFAErrorsTypes } from '../../../src/core/usecases/driver/create_mfa.driver'
import MFA from '../../../src/core/usecases/mfa.usecase'

describe('mfa usecase', function () {
  const mfaId = faker.datatype.number(6).toString()
  const user: User = {
    id: faker.datatype.uuid(),
    name: faker.name.findName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
  }
  const strategy = Strategy.EMAIL
  it('should succeed when creating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenResolve(
      mfaId
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const mFA = new MFA(findingUser, creatingMFA, validatingMFA)
    const response = await mFA.create({ userId: user.id, strategy })

    verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
    verify(mockValidatingMFA.validate(mfaId)).never()
    expect(response).to.eql(mfaId)
  })
  it('should succeed when validating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenResolve(
      mfaId
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(findingUser, creatingMFA, validatingMFA)
    const response = await testClass.validate(mfaId)

    verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).never()
    verify(mockValidatingMFA.validate(mfaId)).once()
    expect(response).to.eql(true)
  })
  it('should fail when creating a mfa', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user.id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(mockCreatingMFA.creatingStrategyForUser(user, strategy)).thenReject(
      new Error(CreatingMFAErrorsTypes.ALREADY_EXIST)
    )
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(findingUser, creatingMFA, validatingMFA)
    try {
      await testClass.create({ userId: user.id, strategy })
    } catch (error) {
      verify(mockCreatingMFA.creatingStrategyForUser(user, strategy)).once()
      verify(mockValidatingMFA.validate(mfaId)).never()
      expect((error as Error).message).to.eql(
        CreateMFAErrorsTypes.WRONG_CREDENTIAL
      )
    }
  })
})
