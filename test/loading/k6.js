import { sleep, check } from 'k6'
import http from 'k6/http'

const BASE_URL = 'http://172.18.0.8:5000'

const USERS = [
  {
    name: 'administratorA',
    email: 'adminA@authplus.com',
    password: '7061651770d7b3ad8fa96e7a8bc6144724',
  },
  {
    name: 'administratorB',
    email: 'adminB@authplus.com',
    password: '7061651770d7b3ad8fa96e7a8bc6144724',
  },
  {
    name: 'administratorC',
    email: 'adminC@authplus.com',
    password: '7061651770d7b3ad8fa96e7a8bc6144724',
  },
  {
    name: 'administratorD',
    email: 'adminD@authplus.com',
    password: '7061651770d7b3ad8fa96e7a8bc6144724',
  },
  {
    name: 'administratorE',
    email: 'adminE@authplus.com',
    password: '7061651770d7b3ad8fa96e7a8bc6144724',
  },
]

export function setup() {
  const resLogin = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({
      email: 'admin@authplus.com',
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  check(resLogin, { 'status was 200': (r) => r.status == 200 })
  const listUser = USERS.map((u) => {
    const resUser = http.post(`${BASE_URL}/user`, JSON.stringify(u))
    check(resUser, { 'status was 200': (r) => r.status == 200 })
    return resUser.body
  })
  Promise.all(listUser).catch((err) => console.error(err))
}

export default function () {
  const resHealth = http.get(`${BASE_URL}/health`)
  check(resHealth, { 'status was 200': (r) => r.status == 200 })
  sleep(1)
}
