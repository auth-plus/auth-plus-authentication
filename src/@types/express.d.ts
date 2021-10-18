declare namespace Express {
  interface Request {
    traceId?: string
    jwtPayload?: Record<string, any>
  }
  interface Response {
    body?: unknown
  }
}
