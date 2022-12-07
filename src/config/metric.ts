import { MetricsSingleton } from '@auth-plus/metrics'

export const metric = MetricsSingleton.getInstance({
  type: 'prometheus',
  config: {},
})

metric.createHistogram('histogram_request', 'distribution of request per hour')
