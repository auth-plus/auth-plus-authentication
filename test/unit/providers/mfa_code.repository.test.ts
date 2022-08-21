import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import redis from '../../../src/core/config/cache'
import { Strategy } from '../../../src/core/entities/strategy'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { CodeService } from '../../../src/core/services/code.service'
import { UuidService } from '../../../src/core/services/uuid.service'
import { FindingMFACodeErrorsTypes } from '../../../src/core/usecases/driven/finding_mfa_code.driven'
import { ValidatingCodeErrorsTypes } from '../../../src/core/usecases/driven/validating_code.driven'

describe('mfa_code repository', () => {
  const mockHash = casual.uuid
  const mockCode = casual.array_of_digits(6).join('')
  const mockUserId = casual.uuid
  const mockStrategy = Strategy.EMAIL
  it('should succeed when creating a mfa hash', async () => {
    const mockUuidService: UuidService = mock(UuidService)
    when(mockUuidService.generateHash()).thenReturn(mockHash)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    when(mockCodeService.generateRandomNumber()).thenReturn(mockCode)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    const result = await mFAChooseRepository.creatingCodeForStrategy(
      mockUserId,
      mockStrategy
    )
    verify(mockUuidService.generateHash()).once()
    verify(mockCodeService.generateRandomNumber()).once()
    expect(result.hash).to.eql(mockHash)
    expect(result.code).to.eql(mockCode)
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
        FindingMFACodeErrorsTypes.MFA_CODE_HASH_NOT_FOUND
      )
    }
  })
  it('should succeed when validating code from cache and inputed code', async () => {
    const mockHash = casual.uuid

    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    await mFAChooseRepository.validate(mockHash, mockHash)
  })
  it('should fail when validating code from cache and inputed code are diff', async () => {
    const mockHash = casual.uuid
    const mockHash2 = casual.uuid

    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)
    try {
      await mFAChooseRepository.validate(mockHash, mockHash2)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ValidatingCodeErrorsTypes.DIFF_CODE
      )
    }
  })
  it('should fail validating inputed GA code', async () => {
    const mockNumber = casual.array_of_digits(6).join('')

    const mockUuidService: UuidService = mock(UuidService)
    const uuidService: UuidService = instance(mockUuidService)

    const mockCodeService: CodeService = mock(CodeService)
    const codeService: CodeService = instance(mockCodeService)

    const mFAChooseRepository = new MFACodeRepository(uuidService, codeService)

    try {
      await mFAChooseRepository.validateGA(mockNumber, mockHash)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ValidatingCodeErrorsTypes.WRONG_CODE
      )
    }
  })
})
