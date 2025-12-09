import casual from 'casual'
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito'

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

describe('login usecase', () => {
  const userId = casual.uuid,
    name = casual.full_name,
    email = casual.email.toLowerCase(),
    password = passwordGenerator(),
    token = tokenGenerator(),
    mfaList = [{ id: casual.uuid, strategy: Strategy.EMAIL }],
    strategyList = mfaList.map((_) => _.strategy),
    user: User = {
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
    const findingUser: FindingUser = instance(mockFindingUser),
      mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve([])
    const findingMFA: FindingMFA = instance(mockFindingMFA),
      mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository),
      creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose),
      mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken),
      testClass = new Login(
        findingUser,
        findingMFA,
        creatingMFAChoose,
        creatingToken
      ),
      response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMfaListByUserId(userId)).once()
    verify(mockCreatingMFAChoose.create(anything(), anything())).never()
    verify(mockCreatingToken.create(user)).once()
    expect(isCredential(response)).toEqual(true)
    expect((response as Credential).id).toEqual(user.id)
    expect((response as Credential).name).toEqual(user.name)
    expect((response as Credential).email).toEqual(user.email)
    expect((response as Credential).token).toEqual(token)
  })

  it('should succeed when enter with correct credential with strategy list', async () => {
    const hash = casual.uuid,
      mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser),
      mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve(mfaList)
    const findingMFA: FindingMFA = instance(mockFindingMFA),
      mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository)
    when(
      mockCreatingMFAChoose.create(user.id, deepEqual(strategyList))
    ).thenResolve(hash)
    const creatingMFAChoose: CreatingMFAChoose = instance(
        mockCreatingMFAChoose
      ),
      mockCreatingToken: CreatingToken = mock(TokenRepository),
      creatingToken: CreatingToken = instance(mockCreatingToken),
      testClass = new Login(
        findingUser,
        findingMFA,
        creatingMFAChoose,
        creatingToken
      ),
      response = await testClass.login(email, password)

    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMfaListByUserId(userId)).once()
    verify(
      mockCreatingMFAChoose.create(user.id, deepEqual(strategyList))
    ).once()
    expect(response).toEqual({ hash, strategyList })
  })

  it('should fail when finding user with this email and password', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(
      mockFindingUser.findUserByEmailAndPassword(email, password)
    ).thenReject(new Error(FindingUserErrorsTypes.PASSWORD_WRONG))
    const findingUser: FindingUser = instance(mockFindingUser),
      mockFindingMFA: FindingMFA = mock(MFARepository)
    when(mockFindingMFA.findMfaListByUserId(userId)).thenResolve([])
    const findingMFA: FindingMFA = instance(mockFindingMFA),
      mockCreatingMFAChoose: CreatingMFAChoose = mock(MFAChooseRepository),
      creatingMFAChoose: CreatingMFAChoose = instance(mockCreatingMFAChoose),
      mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenReturn(token)
    const creatingToken: CreatingToken = instance(mockCreatingToken),
      testClass = new Login(
        findingUser,
        findingMFA,
        creatingMFAChoose,
        creatingToken
      )
    await expect(testClass.login(email, password)).rejects.toThrow(
      LoginUserErrorsTypes.WRONG_CREDENTIAL
    )
    verify(mockFindingUser.findUserByEmailAndPassword(email, password)).once()
    verify(mockFindingMFA.findMfaListByUserId(userId)).never()
    verify(mockCreatingMFAChoose.create(anything(), anything())).never()
    verify(mockCreatingToken.create(user)).never()
  })
})
