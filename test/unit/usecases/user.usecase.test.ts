import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingUser } from '../../../src/core/usecases/driven/creating_user.driven'
import User from '../../../src/core/usecases/user.usecase'

describe('mfa choose usecase', function () {
  const id = 'any-id'
  const name = 'any-name'
  const email = 'any-email'
  const password = 'any-password'
  it('should succeed when enter with correct credential but has no strategy list', async () => {
    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenResolve(id)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const testClass = new User(creatingUser)
    const response = await testClass.create(name, email, password)

    verify(mockCreatingUser.create(name, email, password)).once()
    expect(response).to.eql(id)
  })
})
