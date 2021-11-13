import { Router, Request, Response, NextFunction } from 'express'

import Core from '../../../core/layers'
import { retriveToken } from '../middlewares/jwt'

const logoutRoute = Router()

logoutRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = retriveToken(req)
      if (!req.jwtPayload) {
        throw new Error('asda')
      }
      const resp = await Core.logout().logout(req.jwtPayload, token)
      res.body = resp
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

logoutRoute.post(
  '/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = retriveToken(req)
      if (!req.jwtPayload) {
        throw new Error('asda')
      }
      const resp = await Core.logout().logout(req.jwtPayload, token, true)
      res.body = resp
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

export default logoutRoute
