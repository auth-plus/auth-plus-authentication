import { expect } from 'chai'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingMFAChoose } from '../../../src/core/usecases/driven/creating_mfa_choose.driven'
import { FindingMFA } from '../../../src/core/usecases/driven/finding_mfa.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import Login from '../../../src/core/usecases/login.usecase'

describe('login usecase', function () {
  const userId = 'any-uuid'
  const email = 'test@test.com'
  const password = '123456'
  const hash = 'any-hash-generated-by-service'
  const strategyList = [Strategy.EMAIL]
  const user: User = {
    id: userId,
    name: 'test_user',
    email,
  }
  it('should succeed when enter with correct credential but has no strategy list', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMFAByUserId(userId)).thenResolve([])
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    const creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose)

    const testClass = new Login(findingUser, findingMFA, creatingMFAChoose)
    const response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMFAByUserId(userId)).once()
    verify(mockCreatingMFAChoose.create(anything(), anything())).never()
    expect(response).to.eql(user)
  })

  it('should succeed when enter with correct credential with strategy list', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMFAByUserId(userId)).thenResolve(strategyList)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    when(mockCreatingMFAChoose.create(userId, strategyList)).thenResolve(hash)
    const creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose)

    const testClass = new Login(findingUser, findingMFA, creatingMFAChoose)
    const response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMFAByUserId(userId)).once()
    verify(mockCreatingMFAChoose.create(userId, strategyList)).once()
    expect(response).to.eql({ hash, strategyList })
  })
})
