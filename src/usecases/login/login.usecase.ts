import { LoginUser } from './driver/login_user.driver'
import { FindingUser } from './driven/finding_user.driven'
import { Credential } from './common/credentials'

export default class Login implements LoginUser {
  private findingUser: FindingUser
  constructor(findingUser: FindingUser) {
    this.findingUser = findingUser
  }

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
}
