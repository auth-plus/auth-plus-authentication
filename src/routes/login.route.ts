import express, { Request, Response, NextFunction } from 'express'

import Login from '../usecases/login/login.usecase'

const route = express.Router()

interface LoginInput {
  email: string
  password: string
}

const login = new Login()

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginInput = req.body
    const resp = await login.login(email, password)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
})

export default route
