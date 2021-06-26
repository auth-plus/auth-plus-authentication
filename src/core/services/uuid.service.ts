import * as uuid from 'uuid'

export class UuidService {
  private version = 4
  generateHash(): string {
    return uuid.v4()
  }
  validate(hash: string): boolean {
    const isValid = uuid.validate(hash)
    const version = uuid.version(hash)
    return isValid && version === this.version
  }
}
