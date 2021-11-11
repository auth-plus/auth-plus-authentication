import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { User } from '../../../src/core/entities/user'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import {
  InvalidatingToken,
  InvalidatingTokenErrorsTypes,
} from '../../../src/core/usecases/driven/invalidating_token.driven'
import { LogoutUserErrorsTypes } from '../../../src/core/usecases/driver/logout_user.driver'
import Logout from '../../../src/core/usecases/logout.usecase'

describe('logout usecase', function () {
  const userId = faker.datatype.uuid()
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  const user: User = {
    id: userId,
    name,
    email,
  }
  it('should succeed when invalidate a single token', async () => {
    const jwtPayload = {
      userId: userId,
    }
    const token = faker.datatype.number(6).toString()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(jwtPayload.userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken, findingUser)
    await testClass.logout(jwtPayload, token)

    verify(mockFindingUser.findById(userId)).never()
    verify(mockInvalidatingToken.invalidate(token)).once()
  })
  it('should succeed when invalidate a all token for a user', async () => {
    const jwtPayload = {
      userId: userId,
    }
    const token = faker.datatype.number(6).toString()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token, user)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken, findingUser)
    await testClass.logout(jwtPayload, token, true)

    verify(mockFindingUser.findById(userId)).once()
    verify(mockInvalidatingToken.invalidate(token, user)).once()
  })
  it('should fail when invalidate a single token', async () => {
    const jwtPayload = {
      userId: userId,
    }
    const token = faker.datatype.number(6).toString()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(jwtPayload.userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenReject(
      new Error(InvalidatingTokenErrorsTypes.NOT_FOUND)
    )
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken, findingUser)
    try {
      await testClass.logout(jwtPayload, token)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        LogoutUserErrorsTypes.WRONG_CREDENTIAL
      )
      verify(mockFindingUser.findById(userId)).never()
      verify(mockInvalidatingToken.invalidate(token)).once()
    }
  })
  it('should fail when finding a user', async () => {
    const jwtPayload = {
      userId: userId,
    }
    const token = faker.datatype.number(6).toString()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(jwtPayload.userId)).thenReject(
      new Error(FindingUserErrorsTypes.NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken, findingUser)
    try {
      await testClass.logout(jwtPayload, token)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        LogoutUserErrorsTypes.WRONG_CREDENTIAL
      )
      verify(mockFindingUser.findById(userId)).once()
      verify(mockInvalidatingToken.invalidate(token)).never()
    }
  })
})
