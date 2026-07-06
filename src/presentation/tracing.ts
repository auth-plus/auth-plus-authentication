import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'

import { getEnv } from '../config/enviroment_config'
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const collectorUrl = getEnv().signoz.url || 'http://otel-collector:4318'

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: getEnv().app.name,
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: `${collectorUrl}/v1/metrics` }),
    }),
  ],
  traceExporter: new OTLPTraceExporter({ url: `${collectorUrl}/v1/traces` }),
  logRecordProcessors: [
    new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter({ url: `${collectorUrl}/v1/logs` }),
    }),
  ],
  instrumentations: [
    getNodeAutoInstrumentations(),
    new WinstonInstrumentation(),
  ],
})

sdk.start()

process.once('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.warn('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
})
