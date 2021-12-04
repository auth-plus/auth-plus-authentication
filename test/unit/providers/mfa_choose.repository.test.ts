import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import redis from '../../../src/core/config/cache'
import { Strategy } from '../../../src/core/entities/strategy'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { UuidService } from '../../../src/core/services/uuid.service'
import { FindingMFAChooseErrorsTypes } from '../../../src/core/usecases/driven/finding_mfa_choose.driven'

describe('mfa_choose repository', () => {
  const mockHash = faker.datatype.uuid()
  const userId = faker.datatype.uuid()
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
  it('should fail when not finding a mfa hash', async function () {
    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mFAChooseRepository = new MFAChooseRepository(uuidService)
    try {
      await mFAChooseRepository.findByHash(mockHash)
    } catch (error) {
      verify(mockUuidService.generateHash()).never()
      expect((error as Error).message).to.eql(
        FindingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  })
})
