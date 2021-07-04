import { mock, instance, when, verify, anything } from 'ts-mockito'
import { expect } from 'chai'

import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import Login from '../../../src/core/usecases/login.usecase'
import { User } from '../../../src/core/entities/user'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { FindingMFA } from '../../../src/core/usecases/driven/finding_mfa.driven'
import { CreatingMFAChoose } from '../../../src/core/usecases/driven/creating_mfa_choose.driven'

describe('login usecase', function () {
  const userId = 'any-uuid'
  const email = 'test@test.com'
  const password = '123456'
  const user: User = {
    id: userId,
    name: 'test_user',
    email,
  }
  it('should succeed when enter with right email but has no strategy list', async () => {
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
    verify(mockCreatingMFAChoose.create(anything(), anything())).never()
    expect(response).to.eql(user)
  })
})
