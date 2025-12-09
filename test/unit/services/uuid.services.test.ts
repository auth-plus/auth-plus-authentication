import { UuidService } from '../../../src/core/services/uuid.service'

describe('uuid service', () => {
  it('should succeed when creating a new uuid', async () => {
    const uuidRegex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    const uuidService = new UuidService(),
      hash = await uuidService.generateHash(),
      ok = uuidRegex.test(hash)
    expect(typeof hash).toEqual('string')
    expect(ok).toEqual(true)
  })
})
