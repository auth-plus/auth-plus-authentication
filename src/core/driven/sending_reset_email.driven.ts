export interface SendingResetEmail {
  sendEmail: (email: string, hash: string) => Promise<void>
}
