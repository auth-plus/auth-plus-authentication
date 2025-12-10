import casual from 'casual'
import { sign, SignOptions } from 'jsonwebtoken'
import { authenticator } from 'otplib'

import { getEnv } from '../../src/config/enviroment_config'

export function jsonGenerator() {
  const keyList = casual.words(casual.integer(1, 9)).split(' ')
  return keyList.reduce(
    (output, key) => ({
      [key]: casual.sentence,
      ...output,
    }),
    {}
  )
}

export function tokenGenerator() {
  const payload = { userId: casual.uuid }
  const option: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '1h',
  }
  return sign(
    payload,
    getEnv().app.jwtSecret ?? 'dPBZ_CSWBApK&7EwL?!_%5dLjTK7An',
    option
  )
}

export function gaGenerator() {
  return authenticator.generateSecret()
}

export function deviceIdGenerator() {
  return casual.password
}

export function passwordGenerator() {
  let password = ''
  const ALLOWED_CHARS =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 0; i < 16; i++) {
    const number = new Uint32Array(1)
    crypto.getRandomValues(number)
    const index = number[0] % ALLOWED_CHARS.length
    password += ALLOWED_CHARS[index]
  }
  return password
}
