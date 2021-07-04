export class EmailService {
  async send(email: string, content: string): Promise<void> {
    console.warn(email, content)
  }
}
