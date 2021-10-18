import { STATUS_CODES } from 'http'

import { Request, Response, NextFunction } from 'express'
import { verify, sign, SignOptions } from 'jsonwebtoken'

import env from '../core/config/enviroment_config'

const option: SignOptions = {
  algorithm: 'ES512',
  expiresIn: '1h',
}

function retriveToken(req: Request): string {
  if (!req.headers.authorization) {
    throw new Error('Not Authorized')
  }
  return req.headers.authorization.split(' ')[1] ?? null
}

function createToken(payload: Record<string, any>): string {
  return sign(payload, env.app.jwtSecret, option)
}

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = retriveToken(req)
    const payload = verify(token, env.app.jwtSecret, option) as Record<
      string,
      any
    >
    req.jwtPayload = payload
    const newToken = createToken(payload)
    res.setHeader('Authorization', newToken)
    next()
  } catch (error) {
    res.status(403).send(STATUS_CODES[403])
  }
}
