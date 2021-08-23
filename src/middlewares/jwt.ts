import { Request, Response, NextFunction } from 'express'

import { metric } from '@core/config/metric'

export function jwt(req: Request, res: Response, next: NextFunction): void {
  const hour = new Date().getHours()
  metric.histogramObserve('histogram_request', hour)
  next()
}
