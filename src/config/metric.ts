import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from 'prom-client'

import { getEnv } from './enviroment_config'

collectDefaultMetrics({ prefix: getEnv().app.name.replaceAll('-', '_') })

export const registry = new Registry()

// Create all custom metrics below
export const histogramRequest = new Histogram({
  name: 'histogram_request',
  help: 'distribution of request per hour',
  buckets: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
  registers: [registry],
})

export const counter200 = new Counter({
  name: 'counter_succees',
  help: 'count of succees',
  registers: [registry],
})

export const counter500 = new Counter({
  name: 'counter_fail',
  help: 'count of fail',
  registers: [registry],
})
