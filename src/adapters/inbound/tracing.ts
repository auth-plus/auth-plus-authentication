import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

const OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317'

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'express-ts-app',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: OTLP_ENDPOINT,
  }),
  logRecordProcessor: new SimpleLogRecordProcessor({
    exporter: new OTLPLogExporter({
      url: OTLP_ENDPOINT,
    }),
  }),
  // 3. Auto-instrument HTTP, Express, and Pino
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PinoInstrumentation({
      disableLogSending: false,
      disableLogCorrelation: false,
    }),
  ],
})

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((error) => console.error('Error shutting down SDK', error))
    .finally(() => process.exit(0))
})

export default sdk
