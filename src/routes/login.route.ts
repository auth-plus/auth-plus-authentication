import express, { Request, Response, NextFunction } from 'express'

import { PasswordService } from '../services/password.service'
import { UserRepository } from '../providers/user.repository'
import Login from '../usecases/login/login.usecase'
import { FindingUser } from '../usecases/login/driven/finding_user.driven'

const route = express.Router()

interface LoginInput {
  email: string
  password: string
}

const passwordService = new PasswordService()
const findingUser: FindingUser = new UserRepository(passwordService)
const login = new Login(findingUser)

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
