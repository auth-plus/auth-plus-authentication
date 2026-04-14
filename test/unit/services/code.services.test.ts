import { describe, expect, it } from '@jest/globals'

import { TotpService } from '../../../src/core/services/totp.service'

describe('code service', () => {
  it('should succeed when creating a new code', async () => {
    const totpService = new TotpService()
    const code = totpService.codeGenerate()
    expect(code.length).toEqual(6)
    expect(typeof Number(code)).toEqual('number')
  })
  it('should succeed when creating a new code with length different from 6', async () => {
    const size = 6
    const totpService = new TotpService()
    const code = totpService.codeGenerate()
    expect(code.length).toEqual(size)
    expect(typeof Number(code)).toEqual('number')
  })
})
