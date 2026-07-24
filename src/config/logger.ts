import { trace } from '@opentelemetry/api';
import pino from 'pino';

export const logger = pino({
  mixin() {
    // Get currently active span from OTel runtime
    const currentSpan = trace.getActiveSpan();
    if (!currentSpan) return {};

    const spanContext = currentSpan.spanContext();
    return {
      // Standard OTel field names for log correlation
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    };
  },
});