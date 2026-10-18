import { useEffect, useState } from 'react'
import ThemeSelector from './ThemeSelector'
import Logo from './Logo'
import MessageText from './MessageText'
import { usingEmulators } from '../firebaseConfig'
import {
  describeSignInError,
  finishRedirectSignIn,
  isCancelledSignIn,
  signInWithGoogle,
} from '../lib/auth'

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
)

// A short sample conversation, the first thing people see.
const PREVIEW = [
  { side: 'start', text: 'Anyone up?' },
  { side: 'end', text: 'Always. We’re bats.' },
  { side: 'start', text: 'Fair point 🦇' },
]

const WelcomePage = () => {
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  // Coming back from a redirect sign-in that failed.
  useEffect(() => {
    finishRedirectSignIn().catch((err) => {
      if (!isCancelledSignIn(err)) setError(describeSignInError(err))
    })
  }, [])

  const signIn = async () => {
    setError('')
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (!isCancelledSignIn(err)) setError(describeSignInError(err))
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="relative min-h-dvh bg-base-200 draggable overflow-hidden">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <ThemeSelector />
      </div>

      <main className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr] items-center gap-12 px-6 py-20 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        {/* Brand + sample conversation */}
        <div className="relative flex flex-col items-center lg:items-start">
          <div className="relative">
            <Logo
              size={260}
              className="text-primary drop-shadow-[0_18px_40px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] w-44 h-44 sm:w-64 sm:h-64"
            />
          </div>

          <div
            className="flex flex-col gap-2 w-full max-w-xs mt-4 lg:ml-16"
            aria-hidden="true"
          >
            {PREVIEW.map((bubble, i) => (
              <div
                key={bubble.text}
                className={`bubble-in flex ${bubble.side === 'end' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${300 + i * 650}ms` }}
              >
                <span
                  className={`px-4 py-2 rounded-3xl text-base shadow-sm ${
                    bubble.side === 'end'
                      ? 'bg-primary text-primary-content rounded-br-md'
                      : 'bg-base-100 text-base-content rounded-bl-md'
                  }`}
                >
                  {bubble.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign in */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-6xl sm:text-7xl xl:text-8xl font-extrabold tracking-[-0.04em] leading-[0.9]">
            ChattyBatty
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-base-content/75 max-w-[34ch] leading-relaxed">
            Message your friends one-on-one or in groups, and pick a theme that
            suits your mood.
          </p>

          <button
            className="btn btn-primary btn-lg mt-10 gap-3 rounded-full px-8 no-drag"
            onClick={signIn}
            disabled={signingIn}
          >
            {signingIn ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <span className="bg-white rounded-full p-1">
                <GoogleMark />
              </span>
            )}
            {signingIn ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p
            role="alert"
            className="mt-4 min-h-6 text-error max-w-[48ch] break-words"
          >
            <MessageText text={error} />
          </p>
          {usingEmulators ? (
            <div
              role="note"
              className="alert alert-warning alert-soft text-sm max-w-[48ch] text-left"
            >
              <p>
                <strong>Test mode.</strong> Sign-in uses the local Firebase
                emulator, so the Google screen is a stand-in: pick any account
                or add a new one. For real Google accounts, run{' '}
                <code className="font-mono">npm run dev</code> with a configured{' '}
                <code className="font-mono">.env</code>.
              </p>
            </div>
          ) : (
            <p className="text-sm text-base-content/55 max-w-[40ch]">
              Your session ends when you close the app.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default WelcomePage
