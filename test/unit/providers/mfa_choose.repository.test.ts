import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import { redis } from '../../../src/core/config/cache'
import { Strategy } from '../../../src/core/entities/strategy'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { UuidService } from '../../../src/core/services/uuid.service'

describe('mfa_choose repository', () => {
  const mockHash = casual.uuid
  const userId = casual.uuid
  const strategyList: Strategy[] = [Strategy.EMAIL]
  it('should succeed when creating a mfa hash', async function () {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenReturn(mockHash)
    const uuidService: UuidService = instance(mockUuidService)

    const mFAChooseRepository = new MFAChooseRepository(uuidService)
    const result = await mFAChooseRepository.create(userId, strategyList)
    verify(mockUuidService.generateHash()).once()
    expect(result).to.eql(mockHash)
  })
  it('should succeed when finding a mfa hash', async function () {
    await redis.set(mockHash, JSON.stringify({ userId, strategyList }))
    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mFAChooseRepository = new MFAChooseRepository(uuidService)
    const result = await mFAChooseRepository.findByHash(mockHash)
    verify(mockUuidService.generateHash()).never()
    expect(result.userId).to.eql(userId)
    expect(result.strategyList).to.eql(strategyList)
    await redis.del(mockHash)
  })
})
