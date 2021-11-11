import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import {
  CreatingMFA,
  CreatingMFAErrorsTypes,
} from '../../../src/core/usecases/driven/creating_mfa.driven'
import { ValidatingMFA } from '../../../src/core/usecases/driven/validating_mfa.driven'
import { CreateMFAErrorsTypes } from '../../../src/core/usecases/driver/create_mfa.driver'
import MFA from '../../../src/core/usecases/mfa.usecase'

describe('mfa usecase', function () {
  const mfaId = faker.datatype.number(6).toString()
  const content = {
    userId: faker.datatype.uuid(),
    name: faker.name.findName(),
    strategy: Strategy.EMAIL,
  }
  it('should succeed when creating a mfa', async () => {
    const { name, userId, strategy } = content

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(
      mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
    ).thenResolve(mfaId)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(creatingMFA, validatingMFA)
    const response = await testClass.create(content)

    verify(
      mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
    ).once()
    verify(mockValidatingMFA.validate(mfaId)).never()
    expect(response).to.eql(mfaId)
  })
  it('should succeed when validating a mfa', async () => {
    const { name, userId, strategy } = content

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(
      mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
    ).thenResolve(mfaId)
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(creatingMFA, validatingMFA)
    const response = await testClass.validate(mfaId)

    verify(
      mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
    ).never()
    verify(mockValidatingMFA.validate(mfaId)).once()
    expect(response).to.eql(true)
  })
  it('should fail when creating a mfa', async () => {
    const { name, userId, strategy } = content

    const mockCreatingMFA: CreatingMFA = mock(MFARepository)
    when(
      mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
    ).thenReject(new Error(CreatingMFAErrorsTypes.ALREADY_EXIST))
    const creatingMFA: CreatingMFA = instance(mockCreatingMFA)

    const mockValidatingMFA: ValidatingMFA = mock(MFARepository)
    when(mockValidatingMFA.validate(mfaId)).thenResolve(true)
    const validatingMFA: ValidatingMFA = instance(mockValidatingMFA)

    const testClass = new MFA(creatingMFA, validatingMFA)
    try {
      await testClass.create(content)
    } catch (error) {
      verify(
        mockCreatingMFA.creatingStrategyForUser(name, userId, strategy)
      ).once()
      verify(mockValidatingMFA.validate(mfaId)).never()
      expect(error.message).to.eql(CreateMFAErrorsTypes.WRONG_CREDENTIAL)
    }
  })
})
