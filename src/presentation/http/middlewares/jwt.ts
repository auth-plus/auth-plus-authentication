import { STATUS_CODES } from 'http'

import { Request, Response, NextFunction } from 'express'
import { verify, sign, SignOptions } from 'jsonwebtoken'

import { getEnv } from '../../../config/enviroment_config'
import logger from '../../../config/logger'

const option: SignOptions = {
  algorithm: 'HS256',
  expiresIn: '1h',
}

export type JwtPayloadContent = {
  userId: string
  now: number
}

export function retriveToken(req: Request): string {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization?.substring(
      7,
      req.headers.authorization?.length
    )
  } else {
    throw new Error('When retriving token from header Authorization')
  }
}

export function removeJwtAttr(token: string): JwtPayloadContent {
  const jwtPayload = verify(token, getEnv().app.jwtSecret, option)
  if (typeof jwtPayload == 'string') {
    throw new Error('Something on JWT went wrong')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, iss, sub, aud, jti, nbf, ...payload } = jwtPayload
  return payload as JwtPayloadContent
}

export function createToken(payload: JwtPayloadContent): string {
  return sign(payload, getEnv().app.jwtSecret, option)
}

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = retriveToken(req)
    verify(token, getEnv().app.jwtSecret, option)
    next()
  } catch (error) {
    logger.error(error)
    const code = 401
    res.status(code).send(`${STATUS_CODES[code]}:${error}`)
  }
}
