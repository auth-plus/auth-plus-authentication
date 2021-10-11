import { initTracer, JaegerTracer } from 'jaeger-client'

import env from './enviroment_config'
import logger from './logger'

export default function getTracer(): JaegerTracer {
  const config = {
    serviceName: env.app.name,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  }
  const options = {
    logger,
  }
  return initTracer(config, options)
}
