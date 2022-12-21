import { Request, Response, NextFunction } from 'express'

import {
  histogramRequest,
  counter200,
  counter500,
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
  if (200 <= status && status < 300) {
    counter200.inc()
  } else {
    counter500.inc()
  }
}
