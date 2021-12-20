import { genSaltSync, hash } from 'bcrypt'
import { expect } from 'chai'
import faker from 'faker'

import database from '../../../src/core/config/database'
import { OrganizationRepository } from '../../../src/core/providers/organization.repository'
import { AddingUserToOrganizationErrorsTypes } from '../../../src/core/usecases/driven/adding_user_to_organization.driven'
import { CreatingOrganizationErrorsTypes } from '../../../src/core/usecases/driven/creating_organization.driven'

describe('organization repository', async () => {
  const userName = faker.name.findName()
  const orgName = faker.internet.domainName()

  it('should succeed when creating a organization without parent', async () => {
    const orgRepository = new OrganizationRepository()
    const orgId = await orgRepository.create(orgName, null)
    expect(orgId).to.be.a('string')

    const results = await database('organization').where('id', orgId)
    expect(results.length).to.be.eql(1)
    const org = results[0]
    expect(org.name).to.be.eql(orgName)
    expect(org.parent_organization_id).to.be.eql(null)
    expect(org.relation_tree_level).to.be.eql(0)

    await database('organization').where('id', orgId).delete()
  })

  it('should succeed when creating a organization with parent', async () => {
    const orgRepository = new OrganizationRepository()
    const resp: Array<{ id: string }> = await database('organization')
      .insert({ name: orgName })
      .returning('id')
    const parentId = resp[0].id
    const orgId = await orgRepository.create(orgName, parentId)
    expect(orgId).to.be.a('string')

    const results = await database('organization').where('id', orgId)
    expect(results.length).to.be.eql(1)
    const org = results[0]
    expect(org.name).to.be.eql(orgName)
    expect(org.parent_organization_id).to.be.eql(parentId)
    expect(org.relation_tree_level).to.be.eql(1)

    await database('organization').whereIn('id', [orgId, parentId]).delete()
  })

  it('should fail when creating a organization with inexistent parent', async () => {
    const parentId = faker.datatype.uuid()
    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.create(orgName, parentId)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    }
    const ids = await database('organization').where('name', orgName)
    expect(ids.length).to.be.eql(0)
  })

  it('should succeed when adding user to a organization', async () => {
    const resp1: Array<{ id: string }> = await database('user')
      .insert({
        name: userName,
        email: faker.internet.email(userName.split(' ')[0]),
        password_hash: await hash(faker.internet.password(16), genSaltSync(12)),
      })
      .returning('id')
    const userId = resp1[0].id
    const resp: Array<{ id: string }> = await database('organization')
      .insert({ name: orgName })
      .returning('id')
    const orgId = resp[0].id
    const orgRepository = new OrganizationRepository()
    const relationId = await orgRepository.addUser(orgId, userId)
    expect(relationId).to.be.a('string')

    let relationList = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(relationList.length).to.be.eql(1)
    let relation = relationList[0]
    expect(relation.organization_id).to.be.eql(orgId)
    expect(relation.user_id).to.be.eql(userId)

    relationList = await database('organization_user').where('user_id', userId)
    expect(relationList.length).to.be.eql(1)
    relation = relationList[0]
    expect(relation.organization_id).to.be.eql(orgId)
    expect(relation.user_id).to.be.eql(userId)

    await database('organization_user').where('id', relationId).delete()
    await database('organization').where('id', orgId).delete()
    await database('user').where('id', userId).del()
  })

  it('should fail when adding user to an inexistent organization', async () => {
    const orgId = faker.datatype.uuid()
    const resp: Array<{ id: string }> = await database('user')
      .insert({
        name: userName,
        email: faker.internet.email(userName.split(' ')[0]),
        password_hash: await hash(faker.internet.password(16), genSaltSync(12)),
      })
      .returning('id')
    const userId = resp[0].id
    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.addUser(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    }
    const ids = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(ids.length).to.be.eql(0)
  })

  it('should fail when adding user to a organization twice', async () => {
    const resp: Array<{ id: string }> = await database('user')
      .insert({
        name: userName,
        email: faker.internet.email(userName.split(' ')[0]),
        password_hash: await hash(faker.internet.password(16), genSaltSync(12)),
      })
      .returning('id')
    const userId = resp[0].id
    const orgId = (
      await database('organization').insert({ name: orgName }).returning('id')
    )[0].id
    const resp2: Array<{ id: string }> = await database('organization_user')
      .insert({
        organization_id: orgId,
        user_id: userId,
      })
      .returning('id')
    const relationId = resp2[0].id
    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.addUser(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.be.eql(
        AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    }

    const relationList = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(relationList.length).to.be.eql(1)

    await database('organization_user').where('id', relationId).delete()
    await database('organization').where('id', orgId).delete()
    await database('user').where('id', userId).del()
  })
})
