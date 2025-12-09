import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'

import { getEnv } from '../config/enviroment_config'

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
})

const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: getEnv().app.name,
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  exporter = new ZipkinExporter({
    url: getEnv().zipkin.url,
  }),
  sdk = new NodeSDK({
    resource,
    spanProcessors: [new SimpleSpanProcessor(exporter)],
    instrumentations: [getNodeAutoInstrumentations()],
  })

sdk.start()
