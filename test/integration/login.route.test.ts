import { expect } from 'chai'
import request from 'supertest'

import database from '../../src/core/config/database'
import app from '../../src/index'

describe('Login Route', () => {
  let id: string
  before(async () => {
    const row: string[] = await database('user')
      .insert({
        name: 'test',
        email: 'teste@test.com',
        password:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0]
  })
  it('should succeed when login', async () => {
    request(app)
      .post('/login')
      .send({
        email: 'teste@teste.com',
        password: '7061651770d7b3ad8fa96e7a8bc61447',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw err
        } else {
          expect(res).to.be.eql({
            id,
            name: 'test',
            email: 'teste@teste.com',
          })
        }
      })
  })
})
