import { CodeService } from '../../../src/core/services/code.service'

describe('code service', () => {
  it('should succeed when creating a new code', async () => {
    const codeService = new CodeService()
    const code = codeService.generateRandomNumber()
    expect(code.length).toEqual(6)
    expect(typeof Number(code)).toEqual('number')
  })
  it('should succeed when creating a new code with length different from 6', async () => {
    const size = 10
    const codeService = new CodeService()
    const code = codeService.generateRandomNumber(size)
    expect(code.length).toEqual(size)
    expect(typeof Number(code)).toEqual('number')
  })
})
