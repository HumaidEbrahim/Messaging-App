import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'
import auth, { db } from '../firebaseConfig'
import { clearUserCache } from './userStore'
import { DEFAULT_STATUS } from './constants'

// Where popups can't open (blocked, or an embedded browser), fall back to a
// full-page redirect to Google and back.
const POPUP_UNAVAILABLE = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
])

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    if (!POPUP_UNAVAILABLE.has(error?.code)) throw error
    await signInWithRedirect(auth, provider)
  }
}

/** Surfaces any error from a redirect sign-in once the user is back. */
export const finishRedirectSignIn = () => getRedirectResult(auth)

// Creates the profile document for a signed-in user the first time they log in.
export const ensureUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) return

  const name = user.displayName || user.email?.split('@')[0] || 'New user'
  await setDoc(userRef, {
    username: name.slice(0, 100),
    status: DEFAULT_STATUS,
    photo: user.photoURL || null,
    creationDate: serverTimestamp(),
    friends: [],
    incomingRequests: [],
    email: user.email?.toLowerCase() || null,
  })
}

export const logout = async () => {
  clearUserCache()
  await signOut(auth)
}

// Popup errors that just mean the user changed their mind.
const CANCELLED_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
])

export const isCancelledSignIn = (error) => CANCELLED_CODES.has(error?.code)

const consoleLink = (path) => {
  const project = import.meta.env.VITE_FIREBASE_PROJECT_ID
  return project
    ? `https://console.firebase.google.com/project/${project}/${path}`
    : 'the Firebase console'
}

/**
 * Explains a sign-in failure. Most of these mean the Firebase project isn't
 * fully set up, so they say exactly what to change and where.
 */
export const describeSignInError = (error) => {
  const code = error?.code ?? ''

  if (code === 'auth/unauthorized-domain') {
    return `${window.location.hostname} isn't allowed to sign in. Add it under Authentication → Settings → Authorized domains: ${consoleLink('authentication/settings')}`
  }
  if (code === 'auth/operation-not-allowed') {
    return `Google sign-in is turned off for this Firebase project. Turn it on under Authentication → Sign-in method → Google: ${consoleLink('authentication/providers')}`
  }
  if (code === 'auth/configuration-not-found') {
    return `Authentication isn't set up for this Firebase project yet. Click "Get started", then enable Google: ${consoleLink('authentication/providers')}`
  }
  if (
    code === 'auth/invalid-api-key' ||
    code.startsWith('auth/api-key-not-valid')
  ) {
    return "The Firebase API key in .env isn't valid. Run npm run setup, or copy the web app config from the Firebase console, then restart the dev server."
  }
  if (code === 'auth/network-request-failed') {
    return "Can't reach Google. Check your connection and try again."
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many sign-in attempts. Wait a minute and try again.'
  }
  if (code === 'auth/popup-blocked') {
    return 'The sign-in window was blocked. Allow pop-ups for this site and try again.'
  }
  if (
    code === 'auth/emulator-config-failed' ||
    code === 'auth/internal-error'
  ) {
    return "Sign-in failed. If you're using the emulators, check that npm run emulators is still running."
  }
  return `Couldn't sign you in${code ? ` (${code})` : ''}. Try again.`
}
