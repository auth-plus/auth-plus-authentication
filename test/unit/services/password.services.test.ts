import casual from 'casual'

import { PasswordService } from '../../../src/core/services/password.service'
import { passwordGenerator } from '../../fixtures/generators'

describe('password service', () => {
  it('should succeed when creating a new hash and comparing after', async () => {
    const { password } = casual
    const passwordService = new PasswordService()
    const hash = await passwordService.generateHash(password)
    const ok = await passwordService.compare(password, hash)
    expect(typeof hash).toEqual('string')
    expect(ok).toEqual(true)
  })
  it('should succeed checking entropy', async () => {
    const name = casual.full_name
    const email = casual.email.toLowerCase()
    const password = passwordGenerator()
    const passwordService = new PasswordService()
    const isOk = passwordService.checkEntropy(password, [name, email])
    expect(isOk).toEqual(true)
  })
  it('should fail checking entropy', async () => {
    const name = casual.full_name
    const email = casual.email.toLowerCase()
    const passwordService = new PasswordService()
    const isOk = passwordService.checkEntropy(name + email, [name, email])
    expect(isOk).toEqual(false)
  })
})
