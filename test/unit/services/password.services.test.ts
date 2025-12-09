import casual from 'casual'

import { PasswordService } from '../../../src/core/services/password.service'
import { passwordGenerator } from '../../fixtures/generators'

describe('password service', () => {
  it('should succeed when creating a new hash and comparing after', async () => {
    const { password } = casual,
      passwordService = new PasswordService(),
      hash = await passwordService.generateHash(password),
      ok = await passwordService.compare(password, hash)
    expect(typeof hash).toEqual('string')
    expect(ok).toEqual(true)
  })
  it('should succeed checking entropy', async () => {
    const name = casual.full_name,
      email = casual.email.toLowerCase(),
      password = passwordGenerator(),
      passwordService = new PasswordService(),
      isOk = passwordService.checkEntropy(password, [name, email])
    expect(isOk).toEqual(true)
  })
  it('should fail checking entropy', async () => {
    const name = casual.full_name,
      email = casual.email.toLowerCase(),
      passwordService = new PasswordService(),
      isOk = passwordService.checkEntropy(name + email, [name, email])
    expect(isOk).toEqual(false)
  })
})
