import casual from 'casual'
import { mock, instance, when, verify } from 'ts-mockito'

import { TokenRepository } from '../../../src/core/providers/token.repository'
import { InvalidatingToken } from '../../../src/core/usecases/driven/invalidating_token.driven'
import { LogoutUserErrorsTypes } from '../../../src/core/usecases/driver/logout_user.driver'
import Logout from '../../../src/core/usecases/logout.usecase'

describe('logout usecase', function () {
  const token = casual.array_of_digits(6).join('')
  it('should succeed when invalidate a single token', async () => {
    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken)
    const result = await testClass.logout(token)
    expect(result).toBeUndefined()

    verify(mockInvalidatingToken.invalidate(token)).once()
  })
  it('should fail when invalidate a single token', async () => {
    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenReject(
      new Error('Some erro on redir occurs')
    )
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken)
    await expect(testClass.logout(token)).rejects.toThrow(
      LogoutUserErrorsTypes.DEPENDECY_ERROR
    )
    verify(mockInvalidatingToken.invalidate(token)).once()
  })
})
