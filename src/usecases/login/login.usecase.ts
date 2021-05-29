import { Strategy } from '../mfa/common/strategy'
import { UserRepository } from '../../providers/user.repository'

import { LoginMFA } from './driver/login_mfa.driver'
import { LoginUser } from './driver/login_user.driver'
import { FindingUser } from './driven/finding_user.driven'
import { Credential } from './common/credentials'

export default class Login implements LoginUser, LoginMFA {
  private findingUser: FindingUser = new UserRepository()

  async login(email: string, password: string): Promise<Credential> {
    const user = await this.findingUser.findUserByEmailAndPassword(
      email,
      password
    )
    return Promise.resolve({
      name: user.name,
      email,
    } as Credential)
  }
  multipleFactorAuthenyication(
    code: string,
    strategy: Strategy
  ): Promise<Credential> {
    return Promise.resolve({
      name: 'Andrew',
      email: 'andrew',
    } as Credential)
  }
}
