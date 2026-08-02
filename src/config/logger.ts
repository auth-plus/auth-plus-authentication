import { trace } from '@opentelemetry/api'
import pino from 'pino'
import { getEnv } from './enviroment_config'

export const logger = pino({
  level:
    getEnv().app.logLevel ||
    (getEnv().app.enviroment === 'production' ? 'info' : 'debug'),
  serializers: {
    email: (val) => (typeof val === 'string' ? maskEmail(val) : val),
    phone: (val) => (typeof val === 'string' ? maskPhone(val) : val),
  },
  redact: {
    paths: [
      'password',
      'confirmPassword',
      'code',
      'token',
      'secret',
      'mfaList[*].secret',
      '*.password',
      '*.confirmPassword',
      '*.code',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  mixin() {
    // Get currently active span from OTel runtime
    const currentSpan = trace.getActiveSpan()
    if (!currentSpan) return {}

    const spanContext = currentSpan.spanContext()
    return {
      // Standard OTel field names for log correlation
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    }
  },
})

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

export function maskPhone(phone: string): string {
  if (!phone) return phone
  if (phone.length <= 5) {
    return '***'
  }
  return `${phone.slice(0, 3)}***${phone.slice(-3)}`
}
