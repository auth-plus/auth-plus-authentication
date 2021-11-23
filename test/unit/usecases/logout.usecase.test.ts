import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { TokenRepository } from '../../../src/core/providers/token.repository'
import {
  InvalidatingToken,
  InvalidatingTokenErrorsTypes,
} from '../../../src/core/usecases/driven/invalidating_token.driven'
import { LogoutUserErrorsTypes } from '../../../src/core/usecases/driver/logout_user.driver'
import Logout from '../../../src/core/usecases/logout.usecase'

describe('logout usecase', function () {
  const token = faker.datatype.number(6).toString()
  it('should succeed when invalidate a single token', async () => {
    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenResolve()
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken)
    await testClass.logout(token)

    verify(mockInvalidatingToken.invalidate(token)).once()
  })
  it('should fail when invalidate a single token', async () => {
    const mockInvalidatingToken: InvalidatingToken = mock(TokenRepository)
    when(mockInvalidatingToken.invalidate(token)).thenReject(
      new Error(InvalidatingTokenErrorsTypes.PROVIDER_ERROR)
    )
    const invalidatingToken: InvalidatingToken = instance(mockInvalidatingToken)

    const testClass = new Logout(invalidatingToken)
    try {
      await testClass.logout(token)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        LogoutUserErrorsTypes.DEPENDECY_ERROR
      )
      verify(mockInvalidatingToken.invalidate(token)).once()
    }
  })
})
