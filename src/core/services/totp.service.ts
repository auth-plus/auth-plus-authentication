import { Secret, TOTP } from 'otpauth'

export class TotpService {
  totp: TOTP
  constructor() {
    this.totp = new TOTP({
      issuer: 'auth-plus-authentication',
      label: 'temp-code-mfa',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new Secret(),
    })
  }
  generateRandomNumber(): string {
    return this.totp.generate()
  }
  validate(token: string): boolean {
    const delta = this.totp.validate({ token, window: 1 })
    return delta !== null
  }
}
