import { trace } from '@opentelemetry/api'
import { Request, Response, NextFunction } from 'express'

import { getEnv } from '../../../config/enviroment_config'

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tracer = trace.getTracer(getEnv().app.name)
  tracer.startActiveSpan('main', (span) => {
    span.setAttribute('HTTP_METHOD', req.method)
    span.setAttribute('HTTP_URL', req.path)
    next()
    span.setAttribute('HTTP_STATUS_CODE', res.statusCode)
    span.addEvent('HTTP_FINISHED', {
      'response.body': JSON.stringify(res.body),
      'request.body': JSON.stringify(req.body),
    })
    span.end()
  })
}
