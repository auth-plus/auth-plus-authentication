import { trace } from '@opentelemetry/api'
import { NextFunction, Request, Response } from 'express'

import { getEnv } from '../../../config/enviroment_config'
import { logger } from '../../../config/logger'

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.send

  const tracer = trace.getTracer(getEnv().app.name)
  tracer.startActiveSpan('main', (span) => {
    span.setAttribute('HTTP_METHOD', req.method)
    span.setAttribute('HTTP_URL', req.path)
    const sendF = (
      body: Record<string, unknown>
    ): Response<string, Record<string, unknown>> => {
      span.setAttribute('HTTP_STATUS_CODE', res.statusCode)
      span.addEvent('HTTP_FINISHED', {
        'response.body': JSON.stringify(body),
        'request.body': req.body,
      })
      span.end()
      logger.info({
        'response.body': JSON.stringify(body),
        'request.body': req.body,
        url: req.path,
        method: req.method,
      })
      return originalJson.call(res, body)
    }
    res.send = sendF

    next()
  })
}
