import casual from 'casual'
import request from 'supertest'

import database from '../../../src/core/config/database'
import server from '../../../src/presentation/http/server'
import { insertOrgIntoDatabase } from '../../fixtures/organization'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Organization Route', () => {
  let managerFixture: UserFixture
  let token = ''
  beforeAll(async () => {
    managerFixture = await insertUserIntoDatabase()
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  afterAll(async () => {
    await database('user').where('id', managerFixture.output.id).del()
  })

  it('should succeed when creating a organization', async () => {
    const orgName = casual.full_name

    const response = await request(server)
      .post('/organization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: orgName,
        parentId: null,
      })
    expect(response.status).toEqual(200)
    const tuples = await database('organization')
      .select('*')
      .where('id', response.body.id)
    const row = tuples[0]
    expect(row.name).toEqual(orgName)
    expect(row.parent_organization_id).toEqual(null)
    expect(row.is_enable).toEqual(true)

    await database('organization').where({ id: response.body.id }).del()
  })

  it('should succeed when updating a organization', async () => {
    const orgFixture = await insertOrgIntoDatabase()
    const newName = casual.full_name

    const response = await request(server)
      .patch('/organization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: orgFixture.output.id,
        name: newName,
        parentId: null,
      })
    expect(response.status).toEqual(200)
    const tuples = await database('organization')
      .select('*')
      .where('id', orgFixture.output.id)
    const row = tuples[0]
    expect(row.name).toEqual(newName)

    await database('organization').where('id', orgFixture.output.id).del()
  })
})
