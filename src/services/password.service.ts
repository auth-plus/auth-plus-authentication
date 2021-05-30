import bcrypt from 'bcrypt'

export class PasswordService {
  private round = 12
  async generateHash(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(this.round)
    return bcrypt.hash(password, salt)
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
