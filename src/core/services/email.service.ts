import { produce } from 'src/config/kafka'

export class EmailService {
  async send(email: string, content: string): Promise<void> {
    await produce('SENT_EMAIL', {
      email,
      content,
    })
  }
}
