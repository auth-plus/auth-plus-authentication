import { Strategy } from '../mfa/common/strategy'

import { LoginUser } from './driver/login_user.driver'
import { FindingUser } from './driven/finding_user.driven'
import { Credential } from './common/credentials'
import { FindingMFA } from './driven/finding_mfa.driven'
export default class Login implements LoginUser {
  private findingUser: FindingUser
  private findingMFA: FindingMFA
  constructor(findingUser: FindingUser, findingMFA: FindingMFA) {
    this.findingUser = findingUser
    this.findingMFA = findingMFA
  }

  async login(
    email: string,
    password: string
  ): Promise<Credential | Array<Strategy>> {
    const user = await this.findingUser.findUserByEmailAndPassword(
      email,
      password
    )
    const mfaList = await this.findingMFA.findMFAByUserId(user.id)
    if (mfaList.length > 0) {
      return Promise.resolve(mfaList)
    } else {
      return Promise.resolve({
        name: user.name,
        email,
      } as Credential)
    }
  }
}
