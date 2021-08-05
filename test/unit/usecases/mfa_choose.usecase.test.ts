import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import { Strategy } from '../../../src/core/entities/strategy'
import { EmailRepository } from '../../../src/core/providers/email.repository'
import { MFAChooseRepository } from '../../../src/core/providers/mfa_choose.repository'
import { MFACodeRepository } from '../../../src/core/providers/mfa_code.repository'
import { CreatingMFACode } from '../../../src/core/usecases/driven/creating_mfa_code.driven'
import { FindingMFAChoose } from '../../../src/core/usecases/driven/finding_mfa_choose.driven'
import { SendingMFACode } from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import MFAChoose from '../../../src/core/usecases/mfa_choose.usecase'

describe('mfa choose usecase', function () {
  const hash = 'any-hash'
  const newHash = 'any-new-hash'
  const userId = 'any-uuid'
  const code = 'any-code'
  const strategyList = [Strategy.EMAIL]
  it('should succeed when enter with correct credential but has no strategy list', async () => {
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
})
