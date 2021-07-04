export class CodeService {
  private CODE_MASX_SIZE = 6
  generateRandomNumber(size = this.CODE_MASX_SIZE): string {
    let resp = ''
    for (let i = 0; i < size; i++) {
      const digit = Math.floor(Math.random() * 10)
      resp += digit
    }
    return resp
  }
}
