import { expect } from 'chai'

import { CodeService } from '../../../src/core/services/code.service'

describe('code service', () => {
  it('should succeed when creating a new code', async () => {
    const codeService = new CodeService()
    const code = codeService.generateRandomNumber()
    expect(code.length).to.eql(6)
    expect(Number(code)).to.be.a('number')
  })
  it('should succeed when creating a new code with length different from 6', async () => {
    const size = 10
    const codeService = new CodeService()
    const code = codeService.generateRandomNumber(size)
    expect(code.length).to.eql(size)
    expect(Number(code)).to.be.a('number')
  })
})
