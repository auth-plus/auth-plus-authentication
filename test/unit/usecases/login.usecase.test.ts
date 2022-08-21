import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito'

import { Credential } from '../../../src/core/entities/credentials'
import { Strategy } from '../../../src/core/entities/strategy'
import { User } from '../../../src/core/entities/user'
import { MFARepository } from '../../../src/core/providers/mfa.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingMFAChoose } from '../../../src/core/usecases/driven/creating_mfa_choose.driven'
import { CreatingToken } from '../../../src/core/usecases/driven/creating_token.driven'
import { FindingMFA } from '../../../src/core/usecases/driven/finding_mfa.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import {
  LoginUserErrorsTypes,
  MFAChoose,
} from '../../../src/core/usecases/driver/login_user.driver'
import Login from '../../../src/core/usecases/login.usecase'
import { passwordGenerator, tokenGenerator } from '../../fixtures/generators'

function isCredential(obj: Credential | MFAChoose): obj is Credential {
  return (obj as Credential) !== undefined
}

describe('login usecase', function () {
  const userId = casual.uuid
  const name = casual.full_name
  const email = casual.email.toLowerCase()
  const password = passwordGenerator()

  const token = tokenGenerator()
  const mfaList = [{ id: casual.uuid, strategy: Strategy.EMAIL }]
  const strategyList = mfaList.map((_) => _.strategy)
  const user: User = {
    id: userId,
    name,
    email,
    info: {
      deviceId: casual.uuid,
      googleAuth: casual.uuid,
      phone: casual.phone,
    },
  }
  it('should succeed when enter with correct credential but has no strategy list', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve([])
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    const creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const testClass = new Login(
      findingUser,
      findingMFA,
      creatingMFAChoose,
      creatingToken
    )
    const response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMfaListByUserId(userId)).once()
    verify(mockCreatingMFAChoose.create(anything(), anything())).never()
    verify(mockCreatingToken.create(user)).once()
    expect(isCredential(response)).to.be.true
    expect((response as Credential).id).to.be.equal(user.id)
    expect((response as Credential).name).to.be.equal(user.name)
    expect((response as Credential).email).to.be.equal(user.email)
    expect((response as Credential).token).to.be.equal(token)
  })

  it('should succeed when enter with correct credential with strategy list', async () => {
    const hash = casual.uuid
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve(mfaList)
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    when(
      mockCreatingMFAChoose.create(user.id, deepEqual(strategyList))
    ).thenResolve(hash)
    const creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const testClass = new Login(
      findingUser,
      findingMFA,
      creatingMFAChoose,
      creatingToken
    )
    const response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMfaListByUserId(userId)).once()
    verify(
      mockCreatingMFAChoose.create(user.id, deepEqual(strategyList))
    ).once()
    expect(response).to.be.deep.equal({ hash, strategyList })
  })

  it('should fail when finding user with this email and password', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenReject(new Error(FindingUserErrorsTypes.PASSWORD_WRONG))
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve([])
    const findingMFA: FindingMFA = instance(mockFindingMFA)

    const mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    const creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose)

    const mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken)

    const testClass = new Login(
      findingUser,
      findingMFA,
      creatingMFAChoose,
      creatingToken
    )
    try {
      await testClass.login(email, password)
    } catch (error) {
      expect((error as Error).message).to.be.equal(
        LoginUserErrorsTypes.WRONG_CREDENTIAL
      )
      verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
      verify(mockFindingMFA.findMfaListByUserId(userId)).never()
      verify(mockCreatingMFAChoose.create(anything(), anything())).never()
      verify(mockCreatingToken.create(user)).never()
    }
  })
})
