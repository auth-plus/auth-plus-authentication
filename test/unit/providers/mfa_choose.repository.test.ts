import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import casual from 'casual'
import { instance, mock, verify, when } from 'ts-mockito'

import { getRedis, RedisClient } from '../../../src/core/config/cache'
import { Strategy } from '../../../src/core/entities/strategy'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { UuidService } from '../../../src/core/services/uuid.service'

describe('mfa_choose repository', () => {
  const mockHash = casual.uuid
  const userId = casual.uuid
  const strategyList: Strategy[] = [Strategy.EMAIL]
  let redis: RedisClient
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    redisContainer = await new RedisContainer('redis:7.0.5').start()
    redis = await getRedis(redisContainer.getConnectionUrl())
    if (!redis.isReady) {
      await redis.connect()
    }
  })

  afterAll(async () => {
    await redis.disconnect()
    await redisContainer.stop()
  })

  it('should succeed when creating a mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenReturn(mockHash)
    const uuidService: UuidService = instance(mockUuidService)
    const mFAChooseRepository = new MFAChooseRepository(redis, uuidService)
    const result = await mFAChooseRepository.create(userId, strategyList)
    verify(mockUuidService.generateHash()).once()
    expect(result).toEqual(mockHash)
  })

  it('should succeed when finding a mfa hash', async () => {
    await redis.set(mockHash, JSON.stringify({ userId, strategyList }))
    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)
    const mFAChooseRepository = new MFAChooseRepository(redis, uuidService)
    const result = await mFAChooseRepository.findByHash(mockHash)
    verify(mockUuidService.generateHash()).never()
    expect(result.userId).toEqual(userId)
    expect(result.strategyList).toEqual(strategyList)
    await redis.del(mockHash)
  })
})
