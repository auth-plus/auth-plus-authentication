import express, { Request, Response, NextFunction } from 'express'

import User from '../usecases/user/user.usecase'
import { UserRepository } from '../providers/user.repository'
import { PasswordService } from '../services/password.service'
import { CreatingUser } from '../usecases/user/driven/creating_user.driven'

const route = express.Router()

interface UserInput {
  name: string
  email: string
  password: string
}

const passwordService = new PasswordService()
const creatingMFA: CreatingUser = new UserRepository(passwordService)
const user = new User(creatingMFA)

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: UserInput = req.body
    const resp = await user.create(name, email, password)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
})

export default route
