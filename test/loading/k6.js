import { check, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      startTime: '1s',
      gracefulStop: '5s',
      vus: 1,
      iterations: 2,
      maxDuration: '10s',
    },
  },
}

const BASE_URL = 'http://172.17.0.1:5000'

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

export async function setup() {
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
  const token = JSON.parse(resLogin.body).token
  check(resLogin, { 'Login status was 200': (r) => r.status == 200 })
  const listUser = USERS.map((u) => {
    const resUser = http.post(`${BASE_URL}/user`, JSON.stringify(u), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    check(resUser, { 'Create status was 200': (r) => r.status == 200 })
    return resUser.body
  })
  await Promise.all(listUser)
}

export default async function () {
  const resHealth = http.get(`${BASE_URL}/health`)
  check(resHealth, { 'health status is 200': (r) => r.status == 200 })
  sleep(1)
}
