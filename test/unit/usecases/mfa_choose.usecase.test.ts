import { expect } from 'chai'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { EmailRepository } from '../../../src/core/providers/email.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import {
  CreatingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrors,
  FindingMFAChooseErrorsTypes,
} from '../../../src/core/usecases/driven/finding_mfa_choose.driven'
import {
  SendingMFACode,
  SendingMFACodeErrors,
  SendingMFACodeErrorsTypes,
} from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { ChooseMFAErrorsTypes } from '../../../src/core/usecases/driver/choose_mfa.driver'
import MFAChoose from '../../../src/core/usecases/mfa_choose.usecase'

describe('mfa choose usecase', function () {
  const hash = 'any-hash'
  const newHash = 'any-new-hash'
  const userId = 'any-uuid'
  const code = 'any-code'
  const strategyList = [Strategy.EMAIL]
  it('should succeed choosing mfa', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    when(
      mockSendingMFACode.sendCodeForUser(userId, code + newHash)
    ).thenResolve()
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    const response = await testClass.choose(hash, Strategy.EMAIL)

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockSendingMFACode.sendCodeForUser(userId, code + newHash)).once()
    expect(response.code).to.eql(code)
    expect(response.hash).to.eql(newHash)
  })

  it('should fail choosing mfa when not finding strategy', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.PHONE)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockSendingMFACode.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when finding hash', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenReject(
      new FindingMFAChooseErrors(FindingMFAChooseErrorsTypes.NOT_FOUND)
    )
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(ChooseMFAErrorsTypes.NOT_FOUND)
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockSendingMFACode.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when finding hash having cache error', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenReject(
      new FindingMFAChooseErrors(
        FindingMFAChooseErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    )
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(mockSendingMFACode.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when creating code', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenReject(
      new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    )
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockSendingMFACode.sendCodeForUser(anything(), anything())).never()
  })

  it('should fail choosing mfa when sending code', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    when(mockSendingMFACode.sendCodeForUser(userId, code + newHash)).thenReject(
      new SendingMFACodeErrors(SendingMFACodeErrorsTypes.NOT_FOUND)
    )
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(ChooseMFAErrorsTypes.NOT_FOUND)
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockSendingMFACode.sendCodeForUser(userId, code + newHash)).once()
  })

  it('should fail choosing mfa when sending code', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenResolve({
      userId,
      strategyList,
    })
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    when(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).thenResolve({ hash: newHash, code })
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMFACode: SendingMFACode = mock(EmailRepository)
    when(mockSendingMFACode.sendCodeForUser(userId, code + newHash)).thenReject(
      new SendingMFACodeErrors(SendingMFACodeErrorsTypes.PROVIDER_ERROR)
    )
    const sendingMFACode: SendingMFACode = instance(mockSendingMFACode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMFACode
    )
    try {
      await testClass.choose(hash, Strategy.EMAIL)
    } catch (error) {
      expect((error as Error).message).to.eql(
        ChooseMFAErrorsTypes.DEPENDECY_ERROR
      )
    }

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockSendingMFACode.sendCodeForUser(userId, code + newHash)).once()
  })
})
