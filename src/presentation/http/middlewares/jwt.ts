import { NextFunction, Request, Response } from 'express'
import { STATUS_CODES } from 'http'
import { Jwt, JwtPayload, sign, verify, VerifyOptions } from 'jsonwebtoken'

import { getEnv } from '../../../config/enviroment_config'
import logger from '../../../config/logger'

const option: VerifyOptions = {
  algorithms: ['HS256'],
}

export interface JwtPayloadContent {
  userId: string
  now: number
}

export function retriveToken(req: Request): string {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization?.substring(
      7,
      req.headers.authorization?.length
    )
  }
  throw new Error('When retriving token from header Authorization')
}

export function removeJwtAttr(token: string): JwtPayloadContent {
  const jwtPayload = verify(token, getEnv().app.jwtSecret, option)
  const payload = extractPayload(jwtPayload)
  return payload as JwtPayloadContent
}

export function createToken(payload: JwtPayloadContent): string {
  return sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    getEnv().app.jwtSecret
  )
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

function isJwt(obj: unknown): obj is Jwt {
  return (obj as Jwt).header != undefined
}
function extractPayload(payload: string | Jwt | JwtPayload) {
  let jwtPayload: JwtPayload
  if (typeof payload === 'string') {
    throw new Error('Something on JWT went wrong')
  }
  if (isJwt(payload)) {
    if (typeof payload.payload === 'string') {
      throw new Error('Something on JWT went wrong')
    }
    jwtPayload = payload.payload
  } else {
    jwtPayload = payload
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, iss, sub, aud, jti, nbf, ...rest } = jwtPayload
  return rest
}
