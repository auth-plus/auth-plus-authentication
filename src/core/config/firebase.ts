/* eslint-disable import/no-named-as-default-member */
import firebase from 'firebase'
import 'firebase/firestore'

import config from './enviroment_config'

firebase.initializeApp({
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
})

export default {
  db: firebase.firestore(),
}
