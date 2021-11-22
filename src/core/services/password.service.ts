import { genSaltSync, hash as hashFunc, compare } from 'bcrypt'
import zxcvbn from 'zxcvbn'

export class PasswordService {
  private round = 12
  async generateHash(password: string): Promise<string> {
    const salt = genSaltSync(this.round)
    return hashFunc(password, salt)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
  }

  checkEntropy(password: string, dictionary: string[]): boolean {
    const entropy = zxcvbn(password, dictionary)
    if (entropy.score < 3) {
      return false
    }
    return true
  }
}
