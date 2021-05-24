export interface FindingUser {
  findUserByEmailAndPassword: (email: string, password: string) => Promise<User>
}

export interface User {
  name: string
}
