import { NextFunction, Request, Response } from 'express'
import { STATUS_CODES } from 'http'
import { verify, VerifyOptions } from 'jsonwebtoken'

import { getEnv } from '../../../config/enviroment_config'
import logger from '../../../config/logger'

const option: VerifyOptions = {
  algorithms: ['HS256'],
}

export interface JwtPayloadContent {
  userId: string
  now: number
}

function retriveToken(req: Request): string {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization?.substring(
      7,
      req.headers.authorization?.length
    )
  }
  throw new Error('When retriving token from header Authorization')
}

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = retriveToken(req)
    const jwtPayload = verify(token, getEnv().app.jwtSecret, option)
    req.token = token
    req.user = jwtPayload as { id: string }
    next()
  } catch (error) {
    logger.error(error)
    res.status(401).send(`${STATUS_CODES[401]}:${error}`)
  }
}

