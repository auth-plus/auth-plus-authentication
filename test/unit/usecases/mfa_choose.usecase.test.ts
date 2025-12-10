import casual from 'casual'
import { anything, instance, mock, verify, when } from 'ts-mockito'

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
  SendingMfaCode,
  SendingMfaCodeErrors,
  SendingMfaCodeErrorsTypes,
} from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { ChooseMFAErrorsTypes } from '../../../src/core/usecases/driver/choose_mfa.driver'
import MFAChoose from '../../../src/core/usecases/mfa_choose.usecase'

describe('mfa choose usecase', () => {
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
    when(
      mockSendingMfaCode.sendCodeByStrategy(userId, code, Strategy.EMAIL)
    ).thenResolve()
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
    verify(
      mockSendingMfaCode.sendCodeByStrategy(userId, code, Strategy.EMAIL)
    ).once()
    expect(response).toEqual(newHash)
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
    await expect(testClass.choose(hash, Strategy.PHONE)).rejects.toThrow(
      ChooseMFAErrorsTypes.STRATEGY_NOT_LISTED
    )

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(
      mockSendingMfaCode.sendCodeByStrategy(anything(), anything(), anything())
    ).never()
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
    await expect(testClass.choose(hash, Strategy.EMAIL)).rejects.toThrow(
      ChooseMFAErrorsTypes.NOT_FOUND
    )

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(anything(), anything())
    ).never()
    verify(
      mockSendingMfaCode.sendCodeByStrategy(anything(), anything(), anything())
    ).never()
  })

  it('should fail choosing mfa when sending code for not finding user email', async () => {
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
    when(
      mockSendingMfaCode.sendCodeByStrategy(userId, code, Strategy.EMAIL)
    ).thenReject(
      new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_EMAIL_NOT_FOUND)
    )
    const sendingMfaCode: SendingMfaCode = instance(mockSendingMfaCode)
    const testClass = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
    )
    await expect(testClass.choose(hash, Strategy.EMAIL)).rejects.toThrow(
      ChooseMFAErrorsTypes.NOT_FOUND
    )

    verify(mockFindingMFAChoose.findByHash(hash)).once()
    verify(
      mockCreatingMFACode.creatingCodeForStrategy(userId, Strategy.EMAIL)
    ).once()
    verify(
      mockSendingMfaCode.sendCodeByStrategy(userId, code, Strategy.EMAIL)
    ).once()
  })
})
