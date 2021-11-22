import { expect } from 'chai'
import faker from 'faker'

import { PasswordService } from '../../../src/core/services/password.service'

describe('password service', () => {
  it('should succeed when creating a new hash and comparing after', async () => {
    const password = '123456789'
    const passwordService = new PasswordService()
    const hash = await passwordService.generateHash(password)
    const ok = await passwordService.compare(password, hash)
    expect(typeof hash).to.eql('string')
    expect(ok).to.eql(true)
  })
  it('should succeed checking entropy', async () => {
    const name = faker.name.findName()
    const email = faker.internet.email(name.split(' ')[0])
    const password = faker.internet.password(10)
    const passwordService = new PasswordService()
    const isOk = passwordService.checkEntropy(password, [name, email])
    expect(isOk).to.eql(true)
  })
  it('should fail checking entropy', async () => {
    const name = faker.name.findName()
    const email = faker.internet.email(name.split(' ')[0])
    const passwordService = new PasswordService()
    const isOk = passwordService.checkEntropy(name + email, [name, email])
    expect(isOk).to.eql(false)
  })
})
