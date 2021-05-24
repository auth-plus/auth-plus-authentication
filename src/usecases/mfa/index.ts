import { creatingMFA } from './driver/creatingMFA'
import { FindingUser } from './driven/FindingUser'
import { Credential } from './common/Credentials'
import { Strategy } from './common/Strategy'
import { UserRepository } from '../../providers/UserRepository'

export default class MFA implements creatingMFA {
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
