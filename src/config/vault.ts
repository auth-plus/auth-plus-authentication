import vault from 'node-vault'

import env from './enviroment_config'

export const safe = vault({
  apiVersion: 'v1', // default
  endpoint: `http://${env.vault.host}:${env.vault.port}`, // default
  token: '1234',
})
