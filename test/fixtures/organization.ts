import casual from 'casual'

import database from '../../src/core/config/database'

export async function insertOrgIntoDatabase(
  name = '',
  parentOrganizationId = null
) {
  if (!name) {
    name = casual.company_name
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
