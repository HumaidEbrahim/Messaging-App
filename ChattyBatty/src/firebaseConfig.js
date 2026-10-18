import { initializeApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  connectAuthEmulator,
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId']

// Names of required env vars that are missing, so the app can explain the
// problem instead of failing with an opaque Firebase error.
export const missingConfig = REQUIRED_KEYS.filter((key) => !firebaseConfig[key])

// With config missing, Firebase would throw while importing; initialise with
// placeholders so the app can render setup instructions instead.
const app = initializeApp(
  missingConfig.length > 0
    ? {
        ...firebaseConfig,
        apiKey: 'missing',
        projectId: 'missing',
        appId: 'missing',
      }
    : firebaseConfig,
)

const auth = getAuth(app)
// Sessions end when the window closes.
setPersistence(auth, browserSessionPersistence)

export const db = getFirestore(app)

// Local development against the Firebase emulators (`npm run emulators`).
export const usingEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'

if (usingEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

export default auth
