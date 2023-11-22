import { v4, validate, version } from 'uuid'

export class UuidService {
  private version = 4
  generateHash(): string {
    return v4()
  }
  validate(hash: string): boolean {
    const isValid = validate(hash)
    const versionResult = version(hash)
    return isValid && versionResult === this.version
  }
}
