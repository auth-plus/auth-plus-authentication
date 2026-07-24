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

// Fallback to local self-hosted SigNoz OTLP gRPC endpoint if environment variables aren't set
const OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317'

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'express-ts-app',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  // 1. Export Traces to SigNoz
  traceExporter: new OTLPTraceExporter({
    url: OTLP_ENDPOINT,
  }),
  // 2. Export Logs to SigNoz
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
      // This automatically injects trace_id and span_id into Pino logs
      // and forwards Pino logs straight to the OTel Logging SDK
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
