import { Request, Response, NextFunction } from 'express'

import { metric } from '../../../config/metric'

export function metricMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const hour = new Date().getHours()
  metric.histogramObserve('histogram_request', hour)
  next()
}
