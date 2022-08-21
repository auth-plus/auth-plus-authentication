import faker from 'faker'

import database from '../../src/core/config/database'

export async function insertOrgIntoDatabase(
  name: string | null,
  parentOrganizationId = null
) {
  if (!name) {
    name = faker.internet.domainName()
  }
  const row: Array<{ id: string }> = await database('organization')
    .insert({
      name,
      parent_organization_id: parentOrganizationId,
    })
    .returning('id')
  return {
    input: {
      name,
      parentOrganizationId,
    },
    output: {
      id: row[0].id,
    },
  }
}
