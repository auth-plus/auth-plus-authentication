import { produce } from '../../../src/config/kafka'
import { run } from '../../../src/presentation/messaging/server'

describe('Sever Kafka', () => {
  before(async () => {
    run()
  })

  it('should succeed when sending to health', async () => {
    await produce('health', {})
  })

  it('should succeed when sending to create organization', async () => {
    await produce('organization-create', {})
  })

  it('should succeed when sending a topic that is not covered', async () => {
    await produce('topic-does-not-exist', {})
  })
})
