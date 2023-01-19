import { Request, Response, NextFunction, Router } from 'express'
import * as Joi from 'joi'

import Core from '../../../core/layers'

// eslint-disable-next-line import/namespace
const { object, string } = Joi.types()

const organizationRoute = Router()

interface OrganizationInput {
  name: string
  parentId: string | null
}
const schema = object.keys({
  name: string.required(),
  parentId: string.allow(null),
})

organizationRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, parentId }: OrganizationInput = await schema.validateAsync(
        req.body
      )
      const id = await Core.organization().create(name, parentId)
      res.body = { id }
      res.status(200).send({ id })
    } catch (error) {
      next(error)
    }
  }
)

interface OrganizationAddUserInput {
  userId: string
  organizationId: string
}
const schema2 = object.keys({
  userId: string.required(),
  organizationId: string.required(),
})

organizationRoute.post(
  '/add',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, userId }: OrganizationAddUserInput =
        await schema2.validateAsync(req.body)
      const resp = await Core.organization().addUser(organizationId, userId)
      res.body = { result: resp }
      res.status(200).send({ result: resp })
    } catch (error) {
      next(error)
    }
  }
)

interface OrganizationUpdateUserInput {
  organizationId: string
  name: string | null
  parentId: string | null
}
const schema3 = object.keys({
  organizationId: string.required(),
  name: string.allow(null),
  parentId: string.allow(null),
})

organizationRoute.patch(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, name, parentId }: OrganizationUpdateUserInput =
        await schema3.validateAsync(req.body)
      const resp = await Core.organization().update(
        organizationId,
        name,
        parentId
      )
      res.body = { result: resp }
      res.status(200).send({ result: resp })
    } catch (error) {
      next(error)
    }
  }
)

export default organizationRoute
