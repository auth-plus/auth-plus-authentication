import { expect } from 'chai'
import { mock, instance, when } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { UuidService } from '../../../src/core/services/uuid.service'

describe('mfa_choose repository', () => {
  const mockHash = 'any-hash'
  const userId = 'any-uuid-user'
  const strategyList: Strategy[] = [Strategy.EMAIL]
  it('should succeed when creating a mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenReturn(mockHash)
    const uuidService: UuidService = instance(mockUuidService)

    const mFAChooseRepository = new MFAChooseRepository(uuidService)
    const result = await mFAChooseRepository.create(userId, strategyList)
    expect(result).to.eql(mockHash)
  })
})
