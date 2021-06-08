import { CreatingUser } from './driven/creating_user.driven'
import { CreateUser } from './driver/create_user.driver'

export default class User implements CreateUser {
  private creatingMFA: CreatingUser
  constructor(creatingMFA: CreatingUser) {
    this.creatingMFA = creatingMFA
  }

  async create(name: string, email: string, password: string): Promise<void> {
    return await this.creatingMFA.createByClass(name, email, password)
  }
}
