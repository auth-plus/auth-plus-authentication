/* eslint-disable @typescript-eslint/no-explicit-any */
import { trace } from '@opentelemetry/api'
import { NextFunction, Request, Response } from 'express'

import { getEnv } from '../../../config/enviroment_config'

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.send,
    // Override the json function

    tracer = trace.getTracer(getEnv().app.name)
  tracer.startActiveSpan('main', (span) => {
    span.setAttribute('HTTP_METHOD', req.method)
    span.setAttribute('HTTP_URL', req.path)
    const sendF = (body: any): Response<any, Record<string, any>> => {
      span.setAttribute('HTTP_STATUS_CODE', res.statusCode)
      span.addEvent('HTTP_FINISHED', {
        'response.body': JSON.stringify(body),
        'request.body': JSON.stringify(req.body),
      })
      span.end()
      return originalJson.call(res, body)
    }
    res.send = sendF
    next()
  })
}
