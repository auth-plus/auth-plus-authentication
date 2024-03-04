import casual from 'casual'

import database from '../../../src/core/config/database'
import { Organization } from '../../../src/core/entities/organization'
import {
  OrganizationRepository,
  OrganizationRow,
} from '../../../src/core/providers/organization.repository'
import { AddingUserToOrganizationErrorsTypes } from '../../../src/core/usecases/driven/adding_user_to_organization.driven'
import { CreatingOrganizationErrorsTypes } from '../../../src/core/usecases/driven/creating_organization.driven'
import { FindingOrganizationErrorsTypes } from '../../../src/core/usecases/driven/finding_organization.driven'
import { UpdatingOrganizationErrorsTypes } from '../../../src/core/usecases/driven/updating_organization.driven'
import { insertOrgIntoDatabase } from '../../fixtures/organization'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('organization repository', () => {
  it('should succeed when creating a organization without parent', async () => {
    const orgName = casual.company_name

    const orgRepository = new OrganizationRepository()
    const orgId = await orgRepository.create(orgName, null)
    expect(typeof orgId).toBe('string')

    const results = await database('organization').where('id', orgId)
    expect(results.length).toEqual(1)
    const org = results[0]
    expect(org.name).toEqual(orgName)
    expect(org.parent_organization_id).toEqual(null)

    await database('organization').where('id', orgId).delete()
  })

  it('should succeed when creating a organization with parent', async () => {
    const orgFixture = await insertOrgIntoDatabase()
    const orgName = casual.company_name

    const orgRepository = new OrganizationRepository()
    const orgId = await orgRepository.create(orgName, orgFixture.output.id)

    expect(typeof orgId).toBe('string')
    const results = await database('organization').where('id', orgId)
    expect(results.length).toEqual(1)
    const org = results[0]
    expect(org.name).toEqual(orgName)
    expect(org.parent_organization_id).toEqual(orgFixture.output.id)

    await database('organization')
      .whereIn('id', [orgId, orgFixture.output.id])
      .delete()
  })

  it('should fail when creating a organization with inexistent parent', async () => {
    const orgName = casual.company_name
    const parentId = casual.uuid

    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.create(orgName, parentId)
    } catch (error) {
      expect((error as Error).message).toEqual(
        CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    }
    const ids = await database('organization').where('name', orgName)
    expect(ids.length).toEqual(0)
  })

  it('should succeed when adding user to a organization', async () => {
    const userFixture = await insertUserIntoDatabase()
    const userId = userFixture.output.id
    const orgFixture = await insertOrgIntoDatabase()
    const orgId = orgFixture.output.id

    const orgRepository = new OrganizationRepository()
    const relationId = await orgRepository.addUser(orgId, userId)

    expect(typeof relationId).toBe('string')
    let relationList = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(relationList.length).toEqual(1)
    let relation = relationList[0]
    expect(relation.organization_id).toEqual(orgId)
    expect(relation.user_id).toEqual(userId)

    relationList = await database('organization_user').where('user_id', userId)
    expect(relationList.length).toEqual(1)
    relation = relationList[0]
    expect(relation.organization_id).toEqual(orgId)
    expect(relation.user_id).toEqual(userId)

    await database('organization_user').where('id', relationId).delete()
    await database('organization').where('id', orgId).delete()
    await database('user').where('id', userId).del()
  })

  it('should fail when adding user to an inexistent organization', async () => {
    const orgId = casual.uuid
    const userFixture = await insertUserIntoDatabase()
    const userId = userFixture.output.id

    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.addUser(orgId, userId)
    } catch (error) {
      expect((error as Error).message).toEqual(
        AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    }
    const ids = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(ids.length).toEqual(0)

    await database('user').where('id', userId).del()
  })

  it('should fail when adding user to a organization twice', async () => {
    const userFixture = await insertUserIntoDatabase()
    const userId = userFixture.output.id
    const orgFixture = await insertOrgIntoDatabase()
    const orgId = orgFixture.output.id
    const relationId: string = (
      await database('organization_user')
        .insert({
          organization_id: orgId,
          user_id: userId,
        })
        .returning('id')
    )[0].id

    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.addUser(orgId, userId)
    } catch (error) {
      expect((error as Error).message).toEqual(
        AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    }

    const relationList = await database('organization_user').where(
      'organization_id',
      orgId
    )
    expect(relationList.length).toEqual(1)

    await database('organization_user').where('id', relationId).delete()
    await database('organization').where('id', orgId).delete()
    await database('user').where('id', userId).del()
  })

  it('should succeed when updating organization', async () => {
    const newName = casual.company_name
    const orgFixture = await insertOrgIntoDatabase()
    const orgId = orgFixture.output.id

    const orgRepository = new OrganizationRepository()
    await orgRepository.update(orgId, newName, null)
    const response = await database<OrganizationRow>('organization')
      .select('*')
      .where('id', orgId)
    expect(response[0].name).toEqual(newName)
    await database('organization').where('id', orgId).delete()
  })

  it('should succeed when finding organization by ID', async () => {
    const orgFixture = await insertOrgIntoDatabase()
    const orgId = orgFixture.output.id

    const orgRepository = new OrganizationRepository()
    const resp = await orgRepository.findById(orgId)

    expect(resp.id).toEqual(orgId)
    expect(resp.name).toEqual(orgFixture.input.name)
    expect(resp.parentOrganizationId).toEqual(null)

    await database('organization').where('id', orgId).delete()
  })

  it('should fail when finding organization by ID', async () => {
    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.findById(casual.uuid)
    } catch (error) {
      expect((error as Error).message).toEqual(
        FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    }
  })

  it('should succeed when check for cycle between organizations', async () => {
    const orgFixtureC = await insertOrgIntoDatabase()
    const currentParentOrgId = orgFixtureC.output.id
    const orgFixtureT = await insertOrgIntoDatabase()
    const targetParentOrgId = orgFixtureT.output.id
    const orgFixture = await insertOrgIntoDatabase()
    const orgId = orgFixture.output.id

    const organization: Organization = {
      id: orgId,
      name: orgFixture.input.name,
      parentOrganizationId: currentParentOrgId,
    }
    const targetOrganization: Organization = {
      id: targetParentOrgId,
      name: orgFixtureT.input.name,
      parentOrganizationId: null,
    }
    const orgRepository = new OrganizationRepository()
    const result = await orgRepository.checkCyclicRelationship(
      organization,
      targetOrganization
    )
    expect(result).toBeUndefined()

    await database('organization').where('id', orgId).delete()
    await database('organization').where('id', currentParentOrgId).delete()
    await database('organization').where('id', targetParentOrgId).delete()
  })
  it('should fail when check for cycle between organizations', async () => {
    const orgFixtureR = await insertOrgIntoDatabase()
    const rootOrgId = orgFixtureR.output.id
    const orgFixtureC = await insertOrgIntoDatabase()
    const childOrgId = orgFixtureC.output.id
    const orgFixtureG = await insertOrgIntoDatabase()
    const grandChildOrgId = orgFixtureG.output.id

    const rootOrg: Organization = {
      id: rootOrgId,
      name: orgFixtureR.input.name,
      parentOrganizationId: null,
    }

    const GrandChildOrg: Organization = {
      id: grandChildOrgId,
      name: orgFixtureG.input.name,
      parentOrganizationId: childOrgId,
    }

    const orgRepository = new OrganizationRepository()
    try {
      await orgRepository.checkCyclicRelationship(rootOrg, GrandChildOrg)
    } catch (error) {
      expect((error as Error).message).toEqual(
        UpdatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    }

    await database('organization').where('id', grandChildOrgId).delete()
    await database('organization').where('id', childOrgId).delete()
    await database('organization').where('id', rootOrgId).delete()
  })
})
