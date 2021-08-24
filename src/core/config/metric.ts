import { MetricsSingleton } from '@auth-plus/metrics'

export const metric = MetricsSingleton.getInstance({
  type: 'prometheus',
  config: {},
})

metric.createHistogram(
  'histogram_request',
  'distribution of request per hour',
  [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ]
)
