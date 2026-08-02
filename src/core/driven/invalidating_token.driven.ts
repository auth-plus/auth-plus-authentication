export interface InvalidatingToken {
  invalidate: (token: string) => Promise<void>
}
