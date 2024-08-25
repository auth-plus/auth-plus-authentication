import casual from 'casual'
import { mock, instance, when, verify } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingToken } from '../../../src/core/usecases/driven/creating_token.driven'
import {
  FindingMFA,
  FindingMFAErrors,
  FindingMFAErrorsTypes,
} from '../../../src/core/usecases/driven/finding_mfa.driven'
import { FindingMFACode } from '../../../src/core/usecases/driven/finding_mfa_code.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { ValidatingCode } from '../../../src/core/usecases/driven/validating_code.driven'
import { FindMFACodeErrorType } from '../../../src/core/usecases/driver/find_mfa_code.driver'
import MFACode from '../../../src/core/usecases/mfa_code.usecase'
import { tokenGenerator } from '../../fixtures/generators'

describe('mfa code usecase', function () {
  const userId = casual.uuid
  const name = casual.full_name
  const phone = casual.phone
  const email = casual.email.toLowerCase()
  const hash = casual.uuid
  const code = casual.array_of_digits(6).join('')
  const token = tokenGenerator()
  const user: User = {
    id: userId,
    name,
    email,
    info: {
      deviceId: casual.uuid,
      googleAuth: casual.uuid,
      phone: phone,
    },
  }

  it('should succeed when finding a mfa code for strategy EMAIL', async () => {
    const strategy = Strategy.EMAIL

    const mockFindingMFACode: FindingMFACode = mock(MFACodeRepository)
    when(mockFindingMFACode.findByHash(hash)).thenResolve({
      userId,
      code,
      strategy,
    })
    const findingMFACode: FindingMFACode = instance(mockFindingMFACode)

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const mockValidatingCode: ValidatingCode = mock(MFACodeRepository)
    when(mockValidatingCode.validate(code, code)).thenReturn()
    const validatingCode: ValidatingCode = instance(mockValidatingCode)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(
      mockFindingMFA.findMFAByUserIdAndStrategy(userId, strategy)
    ).thenResolve({
      id: casual.uuid,
      userId,
      strategy,
    })
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const testClass = new MFACode(
      findingMFACode,
      findingUser,
      creatingToken,
      validatingCode,
      findingMFA
    )
    const response = await testClass.find(hash, code)

    verify(mockFindingMFACode.findByHash(hash)).once()
    verify(mockFindingUser.findById(userId)).once()
    verify(mockCreatingToken.create(user)).once()
    verify(mockValidatingCode.validate(code, code)).once()
    expect(response.id).toEqual(user.id)
    expect(response.name).toEqual(user.name)
    expect(response.email).toEqual(user.email)
  })
  it('should succeed when finding a mfa code for strategy GA', async () => {
    const strategy = Strategy.GA

    const mockFindingMFACode: FindingMFACode = mock(MFACodeRepository)
    when(mockFindingMFACode.findByHash(hash)).thenResolve({
      userId,
      code,
      strategy,
    })
    const findingMFACode: FindingMFACode = instance(mockFindingMFACode)

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const mockValidatingCode: ValidatingCode = mock(MFACodeRepository)
    if (user.info.googleAuth) {
      when(
        mockValidatingCode.validateGA(code, user.info.googleAuth)
      ).thenReturn()
    }
    const validatingCode: ValidatingCode = instance(mockValidatingCode)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(
      mockFindingMFA.findMFAByUserIdAndStrategy(userId, strategy)
    ).thenResolve({
      id: casual.uuid,
      userId,
      strategy,
    })
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const testClass = new MFACode(
      findingMFACode,
      findingUser,
      creatingToken,
      validatingCode,
      findingMFA
    )
    const response = await testClass.find(hash, code)

    verify(mockFindingMFACode.findByHash(hash)).once()
    if (user.info.googleAuth) {
      verify(mockValidatingCode.validateGA(code, user.info.googleAuth)).once()
    }
    verify(mockFindingUser.findById(userId)).once()
    verify(mockCreatingToken.create(user)).once()
    expect(response.id).toEqual(user.id)
    expect(response.name).toEqual(user.name)
    expect(response.email).toEqual(user.email)
  })
  it('should fail when finding a mfa code', async () => {
    const strategy = Strategy.EMAIL

    const mockFindingMFACode: FindingMFACode = mock(MFACodeRepository)
    when(mockFindingMFACode.findByHash(hash)).thenResolve({
      userId,
      code,
      strategy,
    })
    const findingMFACode: FindingMFACode = instance(mockFindingMFACode)

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const mockValidatingCode: ValidatingCode = mock(MFACodeRepository)
    when(mockValidatingCode.validate(code, code)).thenReturn()
    const validatingCode: ValidatingCode = instance(mockValidatingCode)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(
      mockFindingMFA.findMFAByUserIdAndStrategy(userId, strategy)
    ).thenReject(new FindingMFAErrors(FindingMFAErrorsTypes.MFA_NOT_FOUND))
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const testClass = new MFACode(
      findingMFACode,
      findingUser,
      creatingToken,
      validatingCode,
      findingMFA
    )
    await expect(testClass.find(hash, code)).rejects.toThrow(
      FindMFACodeErrorType.NOT_FOUND
    )
  })
})
