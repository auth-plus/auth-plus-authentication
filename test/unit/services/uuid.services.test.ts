import { expect } from 'chai'

import { UuidService } from '../../../src/core/services/uuid.service'

describe('uuid service', () => {
  it('should succeed when creating a new uuid', async () => {
    const uuidService = new UuidService()
    const hash = await uuidService.generateHash()
    const ok = await uuidService.validate(hash)
    expect(typeof hash).to.eql('string')
    expect(ok).to.eql(true)
  })
})
