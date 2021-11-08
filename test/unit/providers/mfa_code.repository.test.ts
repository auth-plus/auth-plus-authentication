import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import redis from '../../../src/core/config/cache'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { CodeService } from '../../../src/core/services/code.service'
import { UuidService } from '../../../src/core/services/uuid.service'
import { CreatingMFACodeErrorsTypes } from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import { FindingMFACodeErrorsTypes } from '../../../src/core/usecases/driven/finding_mfa_code.driven'

describe('mfa_code repository', () => {
  const mockHash = faker.datatype.uuid()
  const mockCode = faker.datatype.number(6).toString()
  const mockUserId = faker.datatype.uuid()
  it('should succeed when creating a mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenReturn(mockHash)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    when(mockCodeService.generateRandomNumber()).thenReturn(mockCode)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    const result = await mFAChooseRepository.creatingCodeForStrategy(mockUserId)
    verify(mockUuidService.generateHash()).once()
    verify(mockCodeService.generateRandomNumber()).once()
    expect(result.hash).to.eql(mockHash)
    expect(result.code).to.eql(mockCode)
  })
  it('should fail when finding a mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenThrow(new Error(''))
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    when(mockCodeService.generateRandomNumber()).thenReturn(mockCode)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    try {
      await mFAChooseRepository.creatingCodeForStrategy(mockUserId)
    } catch (error) {
      verify(mockUuidService.generateHash()).once()
      verify(mockCodeService.generateRandomNumber()).never()
      expect((error as Error).message).to.eql(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  })
  it('should succeed when finding by mfa hash', async () => {
    await redis.set(
      mockHash,
      JSON.stringify({ userId: mockUserId, code: mockCode })
    )

    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    const result = await mFAChooseRepository.findByHash(mockHash)
    verify(mockUuidService.generateHash()).never()
    verify(mockCodeService.generateRandomNumber()).never()
    expect(result.userId).to.eql(mockUserId)
    expect(result.code).to.eql(mockCode)
    await redis.del(mockHash)
  })
  it('should fail when finding by mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    try {
      await mFAChooseRepository.findByHash(mockHash)
    } catch (error) {
      verify(mockUuidService.generateHash()).never()
      verify(mockCodeService.generateRandomNumber()).never()
      expect((error as Error).message).to.eql(
        FindingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  })
})
