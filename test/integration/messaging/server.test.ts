import { consume, produce } from '../../../src/config/kafka'
import { app } from '../../../src/presentation/messaging/app'

describe('Sever Kafka', () => {
  before(async () => {
    consume(app).catch((e) => new Error(e))
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
