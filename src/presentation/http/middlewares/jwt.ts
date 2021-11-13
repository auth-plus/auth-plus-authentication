import { STATUS_CODES } from 'http'

import { Request, Response, NextFunction } from 'express'
import { verify, sign, SignOptions, JwtPayload } from 'jsonwebtoken'

import env from '../../../config/enviroment_config'
import logger from '../../../config/logger'

const option: SignOptions = {
  algorithm: 'HS256',
  expiresIn: '1h',
}

export function retriveToken(req: Request): string {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return req.headers.authorization?.substring(
        7,
        req.headers.authorization?.length
      )
    } else {
      throw new Error('When retriving token from header Authorization')
    }
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

function removeJwtAttr(jwtPayload: string | JwtPayload): Record<string, any> {
  if (typeof jwtPayload === 'string') {
    throw new Error('JWT payload is wrong')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, ...payload } = jwtPayload
  return payload as Record<string, any>
}

export function createToken(payload: Record<string, any>): string {
  try {
    return sign(payload, env.app.jwtSecret, option)
  } catch (error) {
    logger.error(error)
    throw new Error((error as Error).message)
  }
}

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = retriveToken(req)
    const jwtPayload = verify(token, env.app.jwtSecret, option)
    const payload = removeJwtAttr(jwtPayload)
    req.jwtPayload = payload
    const newToken = createToken(payload)
    res.setHeader('Access-Control-Allow-Origin', 'Authorization')
    res.setHeader('Authorization', newToken)
    next()
  } catch (error) {
    const code = 401
    res.status(code).send(`${STATUS_CODES[code]}:${(error as Error).message}`)
  }
}
