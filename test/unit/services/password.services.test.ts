import { expect } from 'chai'

import { PasswordService } from '../../../src/core/services/password.service'

describe('password service', () => {
  const password = '123456789'
  it('should succeed when creating a new hash and comparing after', async () => {
    const passwordService = new PasswordService()
    const hash = await passwordService.generateHash(password)
    const ok = await passwordService.compare(password, hash)
    expect(typeof hash).to.eql('string')
    expect(ok).to.eql(true)
  })
})
