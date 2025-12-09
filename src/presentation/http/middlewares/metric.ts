import { NextFunction, Request, Response } from 'express'

import {
  counter200,
  counter500,
  histogramRequest,
} from '../../../config/metric'

export function metricMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const hour = new Date().getHours()
  histogramRequest.observe(hour)
  next()
  const status = res.statusCode
  if (status >= 200 && status < 300) {
    counter200.inc()
  } else {
    counter500.inc()
  }
}
