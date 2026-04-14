import crypto from 'crypto'
import { Secret, TOTP } from 'otpauth'
export class TotpService {
  private CODE_MASX_SIZE = 6

  secretGenerate(): string {
    const totp = new TOTP({
      issuer: 'auth-plus-authentication',
      label: 'temp-code-mfa',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new Secret(),
    })
    return totp.generate()
  }
  codeGenerate(size = this.CODE_MASX_SIZE): string {
    let resp = ''
    for (let i = 0; i < size; i++) {
      const digit = crypto.randomInt(9)
      resp += digit
    }
    return resp
  }
  validate(token: string, secret: string): boolean {
    const totp = new TOTP({
      issuer: 'auth-plus-authentication',
      label: 'temp-code-mfa',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    })
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}
