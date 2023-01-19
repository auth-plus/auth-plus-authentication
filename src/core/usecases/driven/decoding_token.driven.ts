export interface DecodingToken {
  decode: (token: string) => Promise<{ isValid: boolean; userId: string }>
}
