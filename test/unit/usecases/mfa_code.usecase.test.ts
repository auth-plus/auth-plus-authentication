import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingMFACode } from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import { CreatingToken } from '../../../src/core/usecases/driven/creating_token.driven'
import { FindingMFACode } from '../../../src/core/usecases/driven/finding_mfa_code.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import MFACode from '../../../src/core/usecases/mfa_code.usecase'

describe('mfa code usecase', function () {
  const userId = faker.datatype.uuid()
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  const hash = faker.datatype.uuid()
  const code = faker.datatype.number(6).toString()
  const token = faker.datatype.string()
  const user: User = {
    id: userId,
    name,
    email,
  }
  const strategy = Strategy.EMAIL
  it('should succeed when creating a mfa code', async () => {
    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, strategy)
    ).thenResolve({ hash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockFindingMFACode: FindingMFACode = mock(MFACodeRepository)
    const findingMFACode: FindingMFACode = instance(mockFindingMFACode)

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const testClass = new MFACode(
      creatingMFACode,
      findingMFACode,
      findingUser,
      creatingToken
    )
    const response = await testClass.create(userId, strategy)

    verify(mockCreatingMFACode.creatingCodeForStrategy(userId, strategy)).once()
    verify(mockFindingMFACode.findByHash(anything())).never()
    verify(mockFindingUser.findById(anything())).never()
    verify(mockCreatingToken.create(user)).never()
    expect(response.code).to.eql(code)
    expect(response.hash).to.eql(hash)
  })

  it('should succeed when finding a mfa code', async () => {
    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockFindingMFACode: FindingMFACode = mock(MFACodeRepository)
    when(mockFindingMFACode.findByHash(hash)).thenResolve({
      userId,
      code,
    })
    const findingMFACode: FindingMFACode = instance(mockFindingMFACode)

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const testClass = new MFACode(
      creatingMFACode,
      findingMFACode,
      findingUser,
      creatingToken
    )
    const response = await testClass.find(hash, code)

    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockFindingMFACode.findByHash(hash)).once()
    verify(mockFindingUser.findById(userId)).once()
    verify(mockCreatingToken.create(user)).once()
    expect(response.id).to.eql(user.id)
    expect(response.name).to.eql(user.name)
    expect(response.email).to.eql(user.email)
  })
})
