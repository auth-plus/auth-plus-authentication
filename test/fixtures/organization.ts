import casual from 'casual'
import { Knex } from 'knex'

interface OrganizationInput {
  name?: string
  parentOrganizationId: string | null
}

export async function insertOrgIntoDatabase(
  database: Knex,
  input?: OrganizationInput
) {
  const name = input?.name ?? casual.company_name
  const row: { id: string }[] = await database('organization')
    .insert({
      name,
      parent_organization_id: input?.parentOrganizationId,
    })
    .returning('id')
  return {
    input: {
      name,
      parentOrganizationId: input?.parentOrganizationId,
    },
    output: {
      id: row[0].id,
    },
  }
}
