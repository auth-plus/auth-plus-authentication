/* eslint-disable sonarjs/no-hardcoded-passwords */
import crypto from 'k6/crypto'
import { check, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  scenarios: {
    smoke: {
      executor: 'shared-iterations',
      startTime: '1s',
      gracefulStop: '5s',
      vus: 10,
      iterations: 20,
      maxDuration: '10s',
    },
  },
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line sonarjs/pseudo-random
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const password = crypto.sha512(generateUUID(), 'hex')

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const BASE_URL = 'http://172.17.0.1:5000'
const USERS = [
  {
    name: 'administratorA',
    email: 'adminA@authplus.com',
    password,
  },
  {
    name: 'administratorB',
    email: 'adminB@authplus.com',
    password,
  },
  {
    name: 'administratorC',
    email: 'adminC@authplus.com',
    password,
  },
  {
    name: 'administratorD',
    email: 'adminD@authplus.com',
    password,
  },
  {
    name: 'administratorE',
    email: 'adminE@authplus.com',
    password,
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
  const loginPassed = check(resLogin, {
    'Login status was 200': (r) => r.status == 200,
  })
  if (!loginPassed) {
    console.error(
      `Login failed! Status: ${resLogin.status}, Body: ${resLogin.body}`
    )
    return // Exits setup early so you can see the error clearly
  }
  console.log(resLogin)
  const token = JSON.parse(resLogin.body).token
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
