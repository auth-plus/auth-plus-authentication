declare namespace Express {
  interface Request {
    traceId?: string
  }
  interface Response {
    body?: unknown
  }
}
