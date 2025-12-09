import casual from 'casual'
import { instance, mock, verify, when } from 'ts-mockito'

import { User } from '../../../src/core/entities/user'
import { TokenRepository } from '../../../src/core/providers/token.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingToken } from '../../../src/core/usecases/driven/creating_token.driven'
import { DecodingToken } from '../../../src/core/usecases/driven/decoding_token.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { InvalidatingToken } from '../../../src/core/usecases/driven/invalidating_token.driven'
import TokenUsecase from '../../../src/core/usecases/token.usecase'
import { tokenGenerator } from '../../fixtures/generators'

describe('token usecase', () => {
  const token = tokenGenerator(),
    userId = casual.uuid,
    user: User = {
      id: userId,
      name: casual.name,
      email: casual.email,
      info: {
        deviceId: casual.uuid,
        googleAuth: casual.uuid,
        phone: casual.phone,
      },
    }
  it('should succeed when refresh token', async () => {
    const mockDecodingToken: DecodingToken = mock(TokenRepository)
    when(mockDecodingToken.decode(token)).thenResolve({ isValid: true, userId })
    const decodingToken: DecodingToken = instance(mockDecodingToken),
      mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser),
      mockCreatingToken: CreatingToken = mock(TokenRepository)
    when(mockCreatingToken.create(user)).thenResolve()
    const creatingToken: CreatingToken = instance(mockCreatingToken),
      mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)
    const testClass = new TokenUsecase(
      decodingToken,
      findingUser,
      creatingToken,
      invalidatingToken
    )
    const cred = await testClass.refresh(token)
    expect(cred.id).toEqual(user.id)
    expect(cred.token).not.toBeNull()
    verify(mockDecodingToken.decode(token)).once()
    verify(mockFindingUser.findById(userId)).once()
    verify(mockCreatingToken.create(user)).once()
    verify(mockInvalidatingToken.invalidate(token)).once()
  })
})
