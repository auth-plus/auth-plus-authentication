import { Request, Response, NextFunction } from 'express'
import { Tags, FORMAT_HTTP_HEADERS } from 'opentracing'

import logger from '../../../config/logger'
import getTracer from '../../../config/trace'

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tracer = getTracer()
  // Extracting the tracing headers from the incoming http request
  const wireCtx = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
  // Creating our span with context from incoming request
  const spanOpt = wireCtx ? { childOf: wireCtx } : {}
  const span = tracer.startSpan(req.path, spanOpt)
  // Use the log api to capture a log
  span.log({ event: 'request_received' })

  // Use the setTag api to capture standard span tags for http traces
  span.setTag(Tags.HTTP_METHOD, req.method)
  span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_SERVER)
  span.setTag(Tags.HTTP_URL, req.path)

  // include trace ID in headers so that we can debug slow requests we see in
  // the browser by looking up the trace ID found in response headers
  const responseHeaders = {}
  tracer.inject(span, FORMAT_HTTP_HEADERS, responseHeaders)
  res.set(responseHeaders)

  // add the span to the request object for any other handler to use the span
  Object.assign(req, { span })

  // finalize the span when the response is completed
  const finishSpan = () => {
    if (res.statusCode >= 500) {
      // Force the span to be collected for http errors
      span.setTag(Tags.SAMPLING_PRIORITY, 1)
      // If error then set the span to error
      span.setTag(Tags.ERROR, true)

      // Response should have meaning info to futher troubleshooting
      span.log({ event: 'error', message: res.statusMessage })
    }
    // Capture the status code
    span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode)
    span.log({ event: 'request_end' })
    span.finish()
    logger.info(span.context().toTraceId(), {
      responseStatusCode: res.statusCode,
      responsePayload: JSON.stringify(res.body),
      requestBody: JSON.stringify(req.body),
    })
  }
  res.on('finish', finishSpan)
  req.traceId = span.context().toTraceId()
  next()
}
