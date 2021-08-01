import { genSaltSync, hash, compare } from 'bcrypt'

export class PasswordService {
  private round = 12
  async generateHash(password: string): Promise<string> {
    const salt = genSaltSync(this.round)
    return hash(password, salt)
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
  }
}
