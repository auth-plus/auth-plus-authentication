import { genSaltSync, hash as hashFunc, compare } from 'bcrypt'

export class PasswordService {
  private round = 12
  async generateHash(password: string): Promise<string> {
    const salt = genSaltSync(this.round)
    return hashFunc(password, salt)
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
  }
}
