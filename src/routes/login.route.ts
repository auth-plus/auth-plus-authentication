import { Router, Request, Response, NextFunction } from 'express'

import Core from '../core/layers'

const loginRoute = Router()

interface LoginInput {
  email: string
  password: string
}

loginRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: LoginInput = req.body
      const resp = await Core.login.login(email, password)
      res.body = resp
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

export default loginRoute
