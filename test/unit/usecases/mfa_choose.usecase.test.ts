import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify, anything } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { CreatingMFACode } from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import {
  FindingMFAChoose,
  FindingMFAChooseErrors,
  FindingMFAChooseErrorsTypes,
} from '../../../src/core/usecases/driven/finding_mfa_choose.driven'
import {
  SendingMfaCodeErrorsTypes,
  SendingMfaCode,
  SendingMfaCodeErrors,
} from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { ChooseMFAErrorsTypes } from '../../../src/core/usecases/driver/choose_mfa.driver'
import MFAChoose from '../../../src/core/usecases/mfa_choose.usecase'

describe('mfa choose usecase', function () {
  const hash = casual.uuid
  const newHash = casual.uuid
  const userId = casual.uuid
  const code = casual.array_of_digits(6).join('')
  const strategyList = [Strategy.EMAIL]
  it('should succeed choosing mfa email', async () => {
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

    const mockSendingMfaCode: SendingMfaCode = mock(NotificationProvider)
    when(mockSendingMfaCode.sendByEmail(userId, newHash)).thenResolve()
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
    )
    const response = await testClass.choose(hash, Strategy.EMAIL)

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(mockSendingMfaCode.sendByEmail(userId, newHash)).once()
    expect(response).to.eql(newHash)
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

    const mockSendingMfaCode: SendingMfaCode = mock(NotificationProvider)
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
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
    verify(mockSendingMfaCode.sendByEmail(anything(), anything())).never()
    verify(mockSendingMfaCode.sendBySms(anything(), anything())).never()
  })

  it('should fail choosing mfa when finding hash', async () => {
    const mockFindingMFAChoose: FindingMFAChoose = mock(MFAChooseRepository)
    when(mockFindingMFAChoose.findByHash(hash)).thenReject(
      new FindingMFAChooseErrors(
        FindingMFAChooseErrorsTypes.MFA_CHOOSE_HASH_NOT_FOUND
      )
    )
    const findingMFAChoose: FindingMFAChoose = instance(mockFindingMFAChoose)

    const mockCreatingMFACode: CreatingMFACode = mock(MFACodeRepository)
    const creatingMFACode: CreatingMFACode = instance(mockCreatingMFACode)

    const mockSendingMfaCode: SendingMfaCode = mock(NotificationProvider)
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
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
    verify(mockSendingMfaCode.sendByEmail(anything(), anything())).never()
    verify(mockSendingMfaCode.sendBySms(anything(), anything())).never()
  })

  it('should fail choosing mfa when sending code for not finding user', async () => {
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

    const mockSendingMfaCode: SendingMfaCode = mock(NotificationProvider)
    when(mockSendingMfaCode.sendByEmail(userId, newHash)).thenReject(
      new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    )
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
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
    verify(mockSendingMfaCode.sendByEmail(userId, newHash)).once()
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

    const mockSendingMfaCode: SendingMfaCode = mock(NotificationProvider)
    when(mockSendingMfaCode.sendByEmail(userId, newHash)).thenReject(
      new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    )
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)

    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
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
    verify(mockSendingMfaCode.sendByEmail(userId, newHash)).once()
  })
})
